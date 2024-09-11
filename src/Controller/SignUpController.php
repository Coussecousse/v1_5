<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\SignUpFormType;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use App\Security\EmailVerifier;
use Symfony\Bridge\Twig\Mime\TemplatedEmail;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Mailer\Exception\TransportExceptionInterface;
use Symfony\Contracts\Translation\TranslatorInterface;
use Symfony\Component\Mime\Address;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;
use SymfonyCasts\Bundle\VerifyEmail\Exception\VerifyEmailExceptionInterface;

class SignUpController extends AbstractController
{

    public function __construct(private EmailVerifier $emailVerifier) {}

    #[Route('api/sign-up', name: 'app_sign_up', methods: ['POST'])]
    public function index(Request $request,
        UserPasswordHasherInterface $passwordHasher, 
        EntityManagerInterface $en): JsonResponse
    {
        $user = new User();
        $form = $this->createForm(SignUpFormType::class, $user);
        $data = $request->request->all();
        $form->submit($data);

        if ($form->isSubmitted() && $form->isValid()) {
            $user->setPassword(
                $passwordHasher->hashPassword(
                $user,
                $form->get('password')->getData()
                )
            );

            $en->persist($user);
            $en->flush();

            try {
                // Try sending the email
                $this->emailVerifier->sendEmailConfirmation('app_verify_email', $user, (
                    new TemplatedEmail())
                    ->from(new Address('no-reply@roadtripclub.com', 'RoadtripClub Mail Bot'))
                    ->to($user->getEmail())
                    ->subject("Confirmation d'email")
                    ->htmlTemplate('registration/confirmation_email.html.twig')
                );

                return new JsonResponse(['status' => 'User created successfully! Email sent.'], Response::HTTP_CREATED);

            } catch (TransportExceptionInterface $e) {
                // Handle email sending errors
                return new JsonResponse(['status' => 'User created, but failed to send email.', 'error' => $e->getMessage()], Response::HTTP_CREATED);
            }
        }

        $errors = [];
        foreach ($form->getErrors(true) as $error) {
            $errors[$error->getOrigin()->getName()] = $error->getMessage();
        }

        return new JsonResponse(['errors' => $errors], Response::HTTP_BAD_REQUEST);
    }


    #[Route('api/verify-email', name: 'app_api_verify_email', methods: ['GET'])]
    public function verifyUserEmail(Request $request, TranslatorInterface $translator, UserRepository $userRepository): JsonResponse {
        $id = $request->get('id');
        $user = $userRepository->find($id);

        if ($user === null) {
            return new JsonResponse(['message' => 'User not found'], Response::HTTP_NOT_FOUND);
        }

        try {
            $this->emailVerifier->handleEmailConfirmation($request, $user);
        } catch (VerifyEmailExceptionInterface $e) {
            return new JsonResponse(['message' => $translator->trans($e->getReason(), [], 'VerifyEmailBundle')], Response::HTTP_BAD_REQUEST);
        }

        return new JsonResponse(['message' => 'Email verified successfully!'], Response::HTTP_OK);
    }

    #[Route('/api/csrf-token', name: 'api_csrf_token', methods: ['GET'])]
    public function getCsrfToken(CsrfTokenManagerInterface $csrfTokenManager): JsonResponse
    {
        $csrfToken = $csrfTokenManager->getToken('sign_up_form')->getValue();
        return new JsonResponse(['csrfToken' => $csrfToken]);
    }

}
