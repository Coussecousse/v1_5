<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\ChangePasswordFormType;
use App\Form\ResetPasswordRequestFormType;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use Exception;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RedirectResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\MailerInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Routing\Generator\UrlGeneratorInterface;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use Symfony\Contracts\HttpClient\Exception\TransportExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use SymfonyCasts\Bundle\ResetPassword\Controller\ResetPasswordControllerTrait;
use SymfonyCasts\Bundle\ResetPassword\Exception\ResetPasswordExceptionInterface;
use SymfonyCasts\Bundle\ResetPassword\ResetPasswordHelperInterface;

class ResetPasswordController extends AbstractController
{
    use ResetPasswordControllerTrait;

    public function __construct(
        private ResetPasswordHelperInterface $resetPasswordHelper,
        private EntityManagerInterface $entityManager
    ) {}

    /**
     * Display & process form to request a password reset.
     */
    #[Route('api/reset-password', name: 'app_forgot_password_request')]
    public function request(Request $request, MailerInterface $mailer, TranslatorInterface $translator, UserRepository $userRepository): JsonResponse
    {
        $form = $this->createForm(ResetPasswordRequestFormType::class);
        $data = $request->request->all();
        $form->submit($data);

        if ($form->isSubmitted() && $form->isValid()) {
            
            $email = $this->getUser() ? $this->getUser()->getUserIdentifier() : $form->get('email')->getData();
            try {
                $this->processSendingPasswordResetEmail(
                    $email,
                    $mailer,
                    $translator
                );

                return new JsonResponse(['message' => 'Password reset email sent.'], Response::HTTP_CREATED);
            } catch (Exception $e) {
                return new JsonResponse(['message' => 'Unable to send reset email.', 'error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
            }
        }

        $errors = [];
        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['message' => 'Invalid form data', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }


    /**
     * Confirmation page after a user has requested a password reset.
     */
    // #[Route('api/reset-password/check-email', name: 'app_check_email')]
    // public function checkEmail(): Response
    // {
    //     // Generate a fake token if the user does not exist or someone hit this page directly.
    //     // This prevents exposing whether or not a user was found with the given email address or not
    //     if (null === ($resetToken = $this->getTokenObjectFromSession())) {
    //         $resetToken = $this->resetPasswordHelper->generateFakeResetToken();
    //     }

    //     return $this->render('reset_password/check_email.html.twig', [
    //         'resetToken' => $resetToken,
    //     ]);
    // }
    #[Route('/api/reset-password/reset/csrf-token', name: 'api_csrf_token_reset_password_change', methods: ['GET'])]
    public function getResetCsrfToken(CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        $csrfToken = $csrfTokenManager->getToken('change_password_form')->getValue();
        return new JsonResponse(['csrfToken' => $csrfToken]);
    }
    /**
     * Validates and process the reset URL that the user clicked in their email.
     */
    #[Route('api/reset-password/reset/{token}', name: 'app_api_reset_password', methods: ['POST'])]
    public function reset(Request $request, UserPasswordHasherInterface $passwordHasher, string $token = null): Response
    {
        if ($token) {
            $this->storeTokenInSession($token);
        } else {
            $token = $this->getTokenFromSession();
        }
        if (null === $token) {
            return new JsonResponse(['message' => 'No reset token found.'], Response::HTTP_NOT_FOUND);
        }

        try {
            /** @var User $user */
            $user = $this->resetPasswordHelper->validateTokenAndFetchUser($token);
        } catch (Exception $e) {
            return new JsonResponse(['message' => 'Invalid or expired token.', 'error' => $e->getMessage()], Response::HTTP_BAD_REQUEST);
        }

        $form = $this->createForm(ChangePasswordFormType::class);

        $data = $request->request->all();
        $form->submit($data);

        if ($form->isSubmitted() && $form->isValid()) {
            $this->resetPasswordHelper->removeResetRequest($token);

            $encodedPassword = $passwordHasher->hashPassword(
                $user,
                $form->get('password')->getData()
            );

            $user->setPassword($encodedPassword);
            $this->entityManager->flush();

            $this->cleanSessionAfterReset();

            return new JsonResponse(['message' => 'Password changed successfully.'], Response::HTTP_OK);
        }

        $errors = [];
        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['message' => 'Invalid form data', 'errors' => $errors], Response::HTTP_BAD_REQUEST);
    }

    private function processSendingPasswordResetEmail(string $emailFormData, MailerInterface $mailer, TranslatorInterface $translator): void
    {
        $user = $this->entityManager->getRepository(User::class)->findOneBy([
            'email' => $emailFormData,
        ]);

        // Do not reveal whether a user account was found or not
        if (!$user) {
            return;
        }

        try {
            $resetToken = $this->resetPasswordHelper->generateResetToken($user);
        } catch (Exception $e) {
            throw new Exception('Unable to generate reset token.', 0, $e);
        }

        $verificationUrl = $this->generateUrl('app_default', ['reactRouting' => ''], UrlGeneratorInterface::ABSOLUTE_URL) . 'reset-password/reset/' . $resetToken->getToken();

        $email = (new TemplatedEmail())
            ->from(new Address('no-reply@roadtripclub.com', 'RoadtripClub Mail Bot'))
            ->to($user->getEmail())
            ->subject('Your password reset request')
            ->htmlTemplate('reset_password/email.html.twig')
            ->context([
                'resetToken' => $resetToken,
                'verificationUrl' => $verificationUrl,
            ]);

        try {
            $mailer->send($email);
        } catch (TransportExceptionInterface $e) {
            throw new Exception('Unable to send reset email.', 0, $e);
        }

        $this->setTokenObjectInSession($resetToken);
    }

    #[Route('/api/reset-password/csrf-token', name: 'api_csrf_token_reset_password', methods: ['GET'])]
    public function getCsrfToken(CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        $csrfToken = $csrfTokenManager->getToken('reset_password_form')->getValue();
        return new JsonResponse(['csrfToken' => $csrfToken]);
    }
}
