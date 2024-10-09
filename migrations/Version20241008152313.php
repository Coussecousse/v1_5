<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

/**
 * Auto-generated Migration: Please modify to your needs!
 */
final class Version20241008152313 extends AbstractMigration
{
    public function getDescription(): string
    {
        return '';
    }

    public function up(Schema $schema): void
    {
        // this up() migration is auto-generated, please modify it to your needs
        $this->addSql('CREATE TABLE activity (id INT AUTO_INCREMENT NOT NULL, type_id INT NOT NULL, lng DOUBLE PRECISION NOT NULL, lat DOUBLE PRECISION NOT NULL, description LONGTEXT NOT NULL, display_name VARCHAR(255) NOT NULL, INDEX IDX_AC74095AC54C8C93 (type_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('CREATE TABLE activity_pic (id INT AUTO_INCREMENT NOT NULL, activity_id INT NOT NULL, path VARCHAR(255) NOT NULL, INDEX IDX_B90DCFCC81C06096 (activity_id), PRIMARY KEY(id)) DEFAULT CHARACTER SET utf8mb4 COLLATE `utf8mb4_unicode_ci` ENGINE = InnoDB');
        $this->addSql('ALTER TABLE activity ADD CONSTRAINT FK_AC74095AC54C8C93 FOREIGN KEY (type_id) REFERENCES tag (id)');
        $this->addSql('ALTER TABLE activity_pic ADD CONSTRAINT FK_B90DCFCC81C06096 FOREIGN KEY (activity_id) REFERENCES activity (id)');
    }

    public function down(Schema $schema): void
    {
        // this down() migration is auto-generated, please modify it to your needs
        $this->addSql('ALTER TABLE activity DROP FOREIGN KEY FK_AC74095AC54C8C93');
        $this->addSql('ALTER TABLE activity_pic DROP FOREIGN KEY FK_B90DCFCC81C06096');
        $this->addSql('DROP TABLE activity');
        $this->addSql('DROP TABLE activity_pic');
    }
}
