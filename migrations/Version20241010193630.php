<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241010193630 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity ADD country_id INT NOT NULL, DROP country');
        $this->addSql('ALTER TABLE activity ADD CONSTRAINT FK_AC74095AF92F3E70 FOREIGN KEY (country_id) REFERENCES country (id)');
        $this->addSql('CREATE INDEX IDX_AC74095AF92F3E70 ON activity (country_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity DROP FOREIGN KEY FK_AC74095AF92F3E70');
        $this->addSql('DROP INDEX IDX_AC74095AF92F3E70 ON activity');
        $this->addSql('ALTER TABLE activity ADD country VARCHAR(50) NOT NULL, DROP country_id');
    }
}
