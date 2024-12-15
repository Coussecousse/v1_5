<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\All;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class UpdateActivityFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('description', type: TextType::class, options: [
                'required' => false,
                'constraints' => [
                    new Length(['min' => 3, 'max' => 1000, 'minMessage' => 'La description doit contenir au moins {{ limit }} caractères.']),
                    new NotBlank(['message' => "Veuillez entrer une description."]),
                ],
            ])
            ->add('activity_pics', type: FileType::class, options: [
                'multiple' => true,
                'mapped'=> false,
                'required' => false,
                'constraints' => [
                    new All([
                        'constraints' => [
                            new File([
                                'maxSize' => '9M', 
                                'mimeTypes' => [
                                    'image/jpeg',
                                    'image/jpg',
                                    'image/png',
                                ],
                                'mimeTypesMessage' => 'Veuillez télécharger une image valide (formats autorisés : .jpeg, .jpg, .png).',
                                'maxSizeMessage' => 'L\'image ne doit pas dépasser {{ limit }} {{ suffix }}.', 
                            ])
                        ]
                    ])
                ],
            ]);
    }
    public function configureOptions(OptionsResolver $resolver): void 
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
        ]);
    }
}