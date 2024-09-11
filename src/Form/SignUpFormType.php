<?php
namespace App\Form;

use App\Entity\User;
use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\CheckboxType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\IsTrue;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class SignUpFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('email', EmailType::class, [
                'label' => 'Adresse email :',
                'required' => true,
                'constraints' => [
                    new NotBlank(['message' => "Veuillez entrer une adresse email."]),
                    new Length(['min' => 3, 'max' => 255, 'minMessage' => 'Votre adresse email doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('username', TextType::class, [
                'label' => "Nom d'utilisateur :",
                'required' => true,
                'constraints' => [
                    new NotBlank(['message' => "Veuillez entrer un pseudo."]),
                    new Length(['min' => 3, 'max' => 35, 'minMessage' => 'Votre pseudo doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('password', PasswordType::class, [
                'mapped' => false,
                'label' => 'Mot de passe :',
                'constraints' => [
                    new NotBlank(['message' => 'Veuillez entrer un mot de passe']),
                    new Length(['min' => 8, 'max' => 32, 'minMessage' => 'Votre mot de passe doit contenir au moins {{ limit }} caractères.']),
                    new Regex([
                        'pattern' => '/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/',
                        'message' => 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre.',
                    ])
                ],
            ])
            ->add('confirmPassword', PasswordType::class, [
                'mapped' => false,
                'label' => 'Confirmer le mot de passe :',
                'constraints' => [
                    new NotBlank(['message' => "Veuillez confirmer votre mot de passe."]),
                    new Callback(['callback' => function ($value, ExecutionContextInterface $context) {
                        $form = $context->getRoot();
                        if ($value !== $form->get('password')->getData()) {
                            $context->buildViolation("Les mots de passe ne sont pas identiques.")
                                ->addViolation();
                        }
                    }]),
                ],
            ])
            ->add('agreeTerms', CheckboxType::class, [
                'mapped' => false,
                'label' => "Accepter les termes :",
                'constraints' => [
                    new IsTrue(['message' => "Vous devez accepter les conditions d'utilisation."]),
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'data_class' => User::class,
        ]);
    }
}
