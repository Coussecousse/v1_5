<?php

namespace App\Form;

use Symfony\Component\Form\AbstractType;
use Symfony\Component\Form\Extension\Core\Type\ChoiceType;
use Symfony\Component\Form\Extension\Core\Type\TextType;
use Symfony\Component\Form\FormBuilderInterface;
use Symfony\Component\OptionsResolver\OptionsResolver;

class RoadtripSearchFormType extends AbstractType
{
    public function buildForm(FormBuilderInterface $builder, array $options): void
    {
        $builder
            ->add('country', TextType::class, [
                'required' => false,
            ])
            ->add('filter', ChoiceType::class, [
                'required' => false,
                'choices' => [
                    'all' => 'all',
                    'mostRecent' => 'mostRecent',
                    'mostPopular' => 'mostOlder',
                ],
            ])
            ->add('price', ChoiceType::class, [
                'required' => false,
                'choices' => [
                    'all' => 'all',
                    'price_1' => 'price_1',
                    'price_2' => 'price_2',
                    'price_3' => 'price_3', 
                ],
            ])
            ->add('duration', ChoiceType::class, [
                'required' => false,
                'choices' => [
                    'all' => 'all',
                    'duration_1' => 'duration_1',
                    'duration_2' => 'duration_2',
                    'duration_3' => 'duration_3',
                ],
            ]);
    }

    public function configureOptions(OptionsResolver $resolver): void
    {
        $resolver->setDefaults([
            'csrf_protection' => false
        ]);
    }
}