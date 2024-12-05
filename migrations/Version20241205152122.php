<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241205152122 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE roadtrip (id INT AUTO_INCREMENT NOT NULL, country_id INT NOT NULL, user_id INT NOT NULL, title VARCHAR(50) NOT NULL, description LONGTEXT DEFAULT NULL, days JSON NOT NULL COMMENT \'(DC2Type:json)\', roads JSON NOT NULL COMMENT \'(DC2Type:json)\', budget INT DEFAULT NULL, INDEX IDX_EA152DDF92F3E70 (country_id), INDEX IDX_EA152DDA76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE roadtrip ADD CONSTRAINT FK_EA152DDF92F3E70 FOREIGN KEY (country_id) REFERENCES country (id)');
        $this->addSql('ALTER TABLE roadtrip ADD CONSTRAINT FK_EA152DDA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE pic ADD roadtrip_id INT DEFAULT NULL');
        $this->addSql('ALTER TABLE pic ADD CONSTRAINT FK_CB34514ECA4CCFF5 FOREIGN KEY (roadtrip_id) REFERENCES roadtrip (id)');
        $this->addSql('CREATE INDEX IDX_CB34514ECA4CCFF5 ON pic (roadtrip_id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE pic DROP FOREIGN KEY FK_CB34514ECA4CCFF5');
        $this->addSql('ALTER TABLE roadtrip DROP FOREIGN KEY FK_EA152DDF92F3E70');
        $this->addSql('ALTER TABLE roadtrip DROP FOREIGN KEY FK_EA152DDA76ED395');
        $this->addSql('DROP TABLE roadtrip');
        $this->addSql('DROP INDEX IDX_CB34514ECA4CCFF5 ON pic');
        $this->addSql('ALTER TABLE pic DROP roadtrip_id');
    }
}
