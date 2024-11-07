<?php

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\EmailType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\PasswordType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;
use Symfony\Component\Validator\Constraints\Regex;

class ChangeProfileInformationsFormType extends AbstractType
{
    public function buildForm(Symfony\Component\Form\FormBuilderInterface $builder, array $options)
    {
        $builder
            ->add('profile_pic', type: FileType::class, options: [
                'required' => false,
                'constraints' => [
                    new File([
                        'maxSize' => '2M', 
                        'mimeTypes' => [
                            'image/jpeg',
                            'image/jpg',
                            'image/png',
                        ],
                        'mimeTypesMessage' => 'Veuillez télécharger une image valide (formats autorisés : .jpeg, .jpg, .png).',
                        'maxSizeMessage' => 'L\'image ne doit pas dépasser {{ limit }} {{ suffix }}.', 
                    ]),
                ],
            ])
            ->add('username', type: TextType::class, options: [
                'required' => false,
                'constraints' => [
                    new NotBlank(['message' => "Veuillez entrer un pseudo."]),
                    new Length(['min' => 3, 'max' => 35, 'minMessage' => 'Votre pseudo doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('email', type: EmailType::class, options: [
                'required' => false,
                'constraints' => [
                    new NotBlank(['message' => "Veuillez entrer une adresse email."]),
                    new Length(['min' => 3, 'max' => 255, 'minMessage' => 'Votre adresse email doit contenir au moins {{ limit }} caractères.']),
                ],
            ])
            ->add('password', type: PasswordType::class, options: [
                'required' => true,
                'constraints' => [
                    new NotBlank(['message' => 'Veuillez entrer un mot de passe']),
                ],
            ]);
    }

    public function configureOptions(Symfony\Component\OptionsResolver\OptionsResolver $resolver): void 
    {
        $resolver->setDefaults([
            'csrf_protection' => true,
            'csrf_token_id' => 'change_profile_informations_form',
        ]);
    }
}