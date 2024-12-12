<?php

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\FileType;
use Symfony\Component\Form\Extension\Core\Type\NumberType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;
use Symfony\Component\Validator\Constraints\All;
use Symfony\Component\Validator\Constraints\File;
use Symfony\Component\Validator\Constraints\Length;
use Symfony\Component\Validator\Constraints\NotBlank;

class RoadtripFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder 
            ->add('title', type: TextType::class, options: [
                'required'=>true , 
                'constraints' => [
                    new NotBlank(['message' => 'Veuillez entrer un titre.']),
                    new Length(['min' => 3, 'max' => 50, 
                    'minMessage' => 'Le titre doit contenir au moins {{ limit }} caractères.',
                    'maxMessage' => 'Le titre doit contenir au maximum {{ limit }} caractères.']),
                ]
            ])
            ->add('country', TextType::class, options: [
                'required' => true,
                'constraints' => [
                    new NotBlank(['message' => 'Veuillez entrer un pays.']),
                    new Length(['min' => 3, 'max' => 50, 
                    'minMessage' => 'Le pays doit contenir au moins {{ limit }} caractères.',
                    'maxMessage' => 'Le pays doit contenir au maximum {{ limit }} caractères.']),
                ]
            ])
            ->add('description', TextType::class, options: [
                'required' => false,
                'constraints' => [
                    new Length(['min' => 0, 'max' => 10000, 'maxMessage' => 'La description doit contenir moins de {{ limit }} caractères.']),
                ]
            ])
            ->add('pics', type: FileType::class, options: [
                'multiple' => true,
                'mapped'=> false,
                'required' => false,
                'constraints' => [
                    new All([
                        'constraints' => [
                            new File([
                                'maxSize' => '10M', 
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
            ])
            ->add('budget', type: NumberType::class, options: [
                'required' => true,
                'constraints' => [
                    new NotBlank(['message' => 'Veuillez entrer un budget.']),
                ]
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void 
    {
        $resolver->setDefaults([
            'csrf_protection' => false,
            'allow_extra_fields' => true,
        ]);
    }
}