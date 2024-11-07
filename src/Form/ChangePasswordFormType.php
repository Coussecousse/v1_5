<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\Callback;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;
use Symfony\Component\Validator\Context\ExecutionContextInterface;

class ChangePasswordFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
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
        ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => true,
            'csrf_token_id' => 'change_password_form',
        ]);
    }
}
