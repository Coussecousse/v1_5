<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241208182527 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activity_favorite_user (activity_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_624706B281C06096 (activity_id), INDEX IDX_624706B2A76ED395 (user_id), PRIMARY KEY(activity_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE roadtrip_user (roadtrip_id INT NOT NULL, user_id INT NOT NULL, INDEX IDX_86EEC04ACA4CCFF5 (roadtrip_id), INDEX IDX_86EEC04AA76ED395 (user_id), PRIMARY KEY(roadtrip_id, user_id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE activity_favorite_user ADD CONSTRAINT FK_624706B281C06096 FOREIGN KEY (activity_id) REFERENCES activity (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE activity_favorite_user ADD CONSTRAINT FK_624706B2A76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE roadtrip_user ADD CONSTRAINT FK_86EEC04ACA4CCFF5 FOREIGN KEY (roadtrip_id) REFERENCES roadtrip (id) ON DELETE CASCADE');
        $this->addSql('ALTER TABLE roadtrip_user ADD CONSTRAINT FK_86EEC04AA76ED395 FOREIGN KEY (user_id) REFERENCES user (id) ON DELETE CASCADE');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity_favorite_user DROP FOREIGN KEY FK_624706B281C06096');
        $this->addSql('ALTER TABLE activity_favorite_user DROP FOREIGN KEY FK_624706B2A76ED395');
        $this->addSql('ALTER TABLE roadtrip_user DROP FOREIGN KEY FK_86EEC04ACA4CCFF5');
        $this->addSql('ALTER TABLE roadtrip_user DROP FOREIGN KEY FK_86EEC04AA76ED395');
        $this->addSql('DROP TABLE activity_favorite_user');
        $this->addSql('DROP TABLE roadtrip_user');
    }
}
