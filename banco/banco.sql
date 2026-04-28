# Host: 192.168.100.106  (Version 11.3.2-MariaDB)
# Date: 2026-04-28 14:46:24
# Generator: MySQL-Front 6.1  (Build 1.26)


#
# Structure for table "categorias"
#

DROP TABLE IF EXISTS `categorias`;
CREATE TABLE `categorias` (
  `Id_bling` varchar(255) NOT NULL DEFAULT '0',
  `descricao` varchar(255) NOT NULL DEFAULT '',
  `codigo_sistema` int(11) NOT NULL DEFAULT 0,
  `data_envio` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`Id_bling`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 
DROP TABLE IF EXISTS `clientes`;
CREATE TABLE `clientes` (
  `Id_bling` varchar(255) NOT NULL DEFAULT '',
  `codigo_sistema` varchar(255) NOT NULL DEFAULT '',
  `cpf` varchar(255) NOT NULL DEFAULT '',
  `data_envio` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`Id_bling`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;
 

DROP TABLE IF EXISTS `config`;
CREATE TABLE `config` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `importar_pedidos` int(11) NOT NULL DEFAULT 0,
  `enviar_estoque` int(10) NOT NULL DEFAULT 0,
  `enviar_precos` int(11) DEFAULT 0,
  `tabela_preco` int(11) NOT NULL DEFAULT 0,
  `enviar_produtos` enum('S','E','N') DEFAULT 'E' COMMENT 'S= gerar vinculo do produto, E= faz o envio\\atualizacao do produto, n=nao enviar',
  `vendedor` int(10) NOT NULL DEFAULT 0,
  `setor` int(10) DEFAULT 1,
  `ult_env_preco` datetime DEFAULT '2000-01-01 00:00:00',
  `ult_env_estoque` datetime DEFAULT '2000-01-01 00:00:00',
  `ult_env_produto` datetime DEFAULT '2000-01-01 00:00:00',
  `caminho_fotos` blob DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 

INSERT INTO `config` VALUES (1,0,0,0,1,'E',0,1,'2026-03-27 16:00:00','2026-03-27 16:00:08','2026-04-27 09:00:00',NULL);

 

DROP TABLE IF EXISTS `config_nfe`;
CREATE TABLE `config_nfe` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_natureza_operacao` varchar(255) DEFAULT NULL,
  `natureza_operacao` varchar(255) DEFAULT NULL,
  `transacao_sistema` varchar(255) DEFAULT NULL,
  `codigo_transacao_sistema` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 

DROP TABLE IF EXISTS `depositos`;
CREATE TABLE `depositos` (
  `Id_bling` varchar(255) NOT NULL DEFAULT '0',
  `descricao` varchar(255) NOT NULL DEFAULT '',
  `situacao` int(11) DEFAULT 0,
  `padrao` enum('N','S') DEFAULT 'N',
  PRIMARY KEY (`Id_bling`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci ROW_FORMAT=DYNAMIC;

 

DROP TABLE IF EXISTS `pedidos`;
CREATE TABLE `pedidos` (
  `Id_bling` varchar(255) NOT NULL DEFAULT '0',
  `codigo_sistema` int(11) NOT NULL DEFAULT 0,
  `data_insercao` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `situacao` char(2) DEFAULT NULL,
  `nf` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`Id_bling`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 

DROP TABLE IF EXISTS `produtos`;
CREATE TABLE `produtos` (
  `Id_bling` varchar(255) NOT NULL DEFAULT '0',
  `descricao` varchar(255) NOT NULL DEFAULT '',
  `codigo_sistema` int(11) NOT NULL DEFAULT 0,
  `data_envio` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `saldo_enviado` decimal(16,2) NOT NULL DEFAULT 0.00,
  `variacao` enum('N','S') DEFAULT 'N',
  `data_recad_sistema` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `data_estoque` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  `com_variacao` enum('N','S') DEFAULT 'N',
  `data_preco` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`Id_bling`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 
DROP TABLE IF EXISTS `produtos_get`;
CREATE TABLE `produtos_get` (
  `Id_bling` varchar(255) NOT NULL DEFAULT '0',
  `descricao` varchar(255) NOT NULL DEFAULT '',
  `codigo_sistema` int(11) NOT NULL DEFAULT 0,
  `data_envio` datetime NOT NULL DEFAULT '0000-00-00 00:00:00',
  PRIMARY KEY (`Id_bling`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 

DROP TABLE IF EXISTS `tokens`;
CREATE TABLE `tokens` (
  `Id` int(11) NOT NULL AUTO_INCREMENT,
  `token` blob DEFAULT NULL,
  `refresh_token` varchar(255) DEFAULT NULL,
  `expires_in` varchar(255) DEFAULT NULL,
  `ult_atualizacao` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`Id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=latin1 COLLATE=latin1_swedish_ci;

 