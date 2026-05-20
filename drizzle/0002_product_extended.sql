ALTER TABLE `products`
  ADD COLUMN `images` text,
  ADD COLUMN `features` text,
  ADD COLUMN `specs` text,
  ADD COLUMN `sizeTables` text,
  ADD COLUMN `careInstructions` text,
  ADD COLUMN `careNote` text,
  ADD COLUMN `collection` varchar(255),
  ADD COLUMN `telegramLink` varchar(500),
  ADD COLUMN `isVisible` tinyint(1) NOT NULL DEFAULT 1;
