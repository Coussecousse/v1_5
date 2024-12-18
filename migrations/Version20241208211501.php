<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241208211501 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity CHANGE report report INT NOT NULL');
        $this->addSql('ALTER TABLE roadtrip CHANGE report report INT NOT NULL');
        $this->addSql('ALTER TABLE user CHANGE report report INT NOT NULL');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity CHANGE report report INT DEFAULT NULL');
        $this->addSql('ALTER TABLE roadtrip CHANGE report report INT DEFAULT NULL');
        $this->addSql('ALTER TABLE user CHANGE report report INT DEFAULT NULL');
    }
}
