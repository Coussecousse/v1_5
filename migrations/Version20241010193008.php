<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241010193008 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE pic (id INT AUTO_INCREMENT NOT NULL, user_id INT DEFAULT NULL, activity_id INT DEFAULT NULL, path VARCHAR(255) NOT NULL, UNIQUE INDEX UNIQ_CB34514EA76ED395 (user_id), INDEX IDX_CB34514E81C06096 (activity_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE pic ADD CONSTRAINT FK_CB34514EA76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE pic ADD CONSTRAINT FK_CB34514E81C06096 FOREIGN KEY (activity_id) REFERENCES activity (id)');
        $this->addSql('ALTER TABLE activity_pic DROP FOREIGN KEY FK_B90DCFCC81C06096');
        $this->addSql('ALTER TABLE profil_pic DROP FOREIGN KEY FK_FE199E03A76ED395');
        $this->addSql('DROP TABLE activity_pic');
        $this->addSql('DROP TABLE profil_pic');
        $this->addSql('ALTER TABLE activity DROP FOREIGN KEY FK_AC74095AF92F3E70');
        $this->addSql('DROP INDEX IDX_AC74095AF92F3E70 ON activity');
        $this->addSql('ALTER TABLE activity ADD country VARCHAR(50) NOT NULL, DROP country_id');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activity_pic (id INT AUTO_INCREMENT NOT NULL, activity_id INT NOT NULL, path VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, INDEX IDX_B90DCFCC81C06096 (activity_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('CREATE TABLE profil_pic (id INT AUTO_INCREMENT NOT NULL, user_id INT NOT NULL, path VARCHAR(255) CHARACTER SET utf8mb4 NOT NULL COLLATE `utf8mb4_unicode_ci`, UNIQUE INDEX UNIQ_FE199E03A76ED395 (user_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB COMMENT = \'\' ');
        $this->addSql('ALTER TABLE activity_pic ADD CONSTRAINT FK_B90DCFCC81C06096 FOREIGN KEY (activity_id) REFERENCES activity (id)');
        $this->addSql('ALTER TABLE profil_pic ADD CONSTRAINT FK_FE199E03A76ED395 FOREIGN KEY (user_id) REFERENCES user (id)');
        $this->addSql('ALTER TABLE pic DROP FOREIGN KEY FK_CB34514EA76ED395');
        $this->addSql('ALTER TABLE pic DROP FOREIGN KEY FK_CB34514E81C06096');
        $this->addSql('DROP TABLE pic');
        $this->addSql('ALTER TABLE activity ADD country_id INT NOT NULL, DROP country');
        $this->addSql('ALTER TABLE activity ADD CONSTRAINT FK_AC74095AF92F3E70 FOREIGN KEY (country_id) REFERENCES country (id)');
        $this->addSql('CREATE INDEX IDX_AC74095AF92F3E70 ON activity (country_id)');
    }
}
