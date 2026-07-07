/*
  Warnings:

  - A unique constraint covering the columns `[secondaryEmail]` on the table `users` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `applications_freelancerId_fkey` ON `applications`;

-- DropIndex
DROP INDEX `audit_logs_userId_fkey` ON `audit_logs`;

-- DropIndex
DROP INDEX `certificates_userId_fkey` ON `certificates`;

-- DropIndex
DROP INDEX `contracts_clientId_fkey` ON `contracts`;

-- DropIndex
DROP INDEX `contracts_freelancerId_fkey` ON `contracts`;

-- DropIndex
DROP INDEX `contracts_projectId_fkey` ON `contracts`;

-- DropIndex
DROP INDEX `conversation_members_userId_fkey` ON `conversation_members`;

-- DropIndex
DROP INDEX `deliveries_contractId_fkey` ON `deliveries`;

-- DropIndex
DROP INDEX `delivery_files_deliveryId_fkey` ON `delivery_files`;

-- DropIndex
DROP INDEX `educations_userId_fkey` ON `educations`;

-- DropIndex
DROP INDEX `experiences_userId_fkey` ON `experiences`;

-- DropIndex
DROP INDEX `favorites_projectId_fkey` ON `favorites`;

-- DropIndex
DROP INDEX `favorites_targetUserId_fkey` ON `favorites`;

-- DropIndex
DROP INDEX `favorites_userId_fkey` ON `favorites`;

-- DropIndex
DROP INDEX `freelancer_skills_skillId_fkey` ON `freelancer_skills`;

-- DropIndex
DROP INDEX `invitations_clientId_fkey` ON `invitations`;

-- DropIndex
DROP INDEX `invitations_freelancerId_fkey` ON `invitations`;

-- DropIndex
DROP INDEX `messages_conversationId_fkey` ON `messages`;

-- DropIndex
DROP INDEX `messages_replyToId_fkey` ON `messages`;

-- DropIndex
DROP INDEX `messages_senderId_fkey` ON `messages`;

-- DropIndex
DROP INDEX `notifications_userId_fkey` ON `notifications`;

-- DropIndex
DROP INDEX `password_resets_userId_fkey` ON `password_resets`;

-- DropIndex
DROP INDEX `payments_contractId_fkey` ON `payments`;

-- DropIndex
DROP INDEX `payments_transactionId_fkey` ON `payments`;

-- DropIndex
DROP INDEX `portfolio_files_portfolioId_fkey` ON `portfolio_files`;

-- DropIndex
DROP INDEX `portfolios_userId_fkey` ON `portfolios`;

-- DropIndex
DROP INDEX `project_files_projectId_fkey` ON `project_files`;

-- DropIndex
DROP INDEX `project_skills_skillId_fkey` ON `project_skills`;

-- DropIndex
DROP INDEX `projects_categoryId_fkey` ON `projects`;

-- DropIndex
DROP INDEX `projects_clientId_fkey` ON `projects`;

-- DropIndex
DROP INDEX `projects_subCategoryId_fkey` ON `projects`;

-- DropIndex
DROP INDEX `reports_reportedUserId_fkey` ON `reports`;

-- DropIndex
DROP INDEX `reports_reporterId_fkey` ON `reports`;

-- DropIndex
DROP INDEX `reviews_clientReviewerId_fkey` ON `reviews`;

-- DropIndex
DROP INDEX `reviews_clientTargetId_fkey` ON `reviews`;

-- DropIndex
DROP INDEX `reviews_contractId_fkey` ON `reviews`;

-- DropIndex
DROP INDEX `reviews_freelancerReviewerId_fkey` ON `reviews`;

-- DropIndex
DROP INDEX `reviews_freelancerTargetId_fkey` ON `reviews`;

-- DropIndex
DROP INDEX `sessions_userId_fkey` ON `sessions`;

-- DropIndex
DROP INDEX `ticket_messages_senderId_fkey` ON `ticket_messages`;

-- DropIndex
DROP INDEX `ticket_messages_ticketId_fkey` ON `ticket_messages`;

-- DropIndex
DROP INDEX `tickets_userId_fkey` ON `tickets`;

-- DropIndex
DROP INDEX `transactions_walletId_fkey` ON `transactions`;

-- DropIndex
DROP INDEX `withdrawals_transactionId_fkey` ON `withdrawals`;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isSecondaryEmailVerified` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `preferredEmailType` ENUM('PRIMARY', 'SECONDARY') NOT NULL DEFAULT 'PRIMARY',
    ADD COLUMN `secondaryEmail` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `users_secondaryEmail_key` ON `users`(`secondaryEmail`);

-- AddForeignKey
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sub_categories` ADD CONSTRAINT `sub_categories_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `freelancer_skills` ADD CONSTRAINT `freelancer_skills_profileId_fkey` FOREIGN KEY (`profileId`) REFERENCES `profiles`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `freelancer_skills` ADD CONSTRAINT `freelancer_skills_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `projects` ADD CONSTRAINT `projects_subCategoryId_fkey` FOREIGN KEY (`subCategoryId`) REFERENCES `sub_categories`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_files` ADD CONSTRAINT `project_files_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_skills` ADD CONSTRAINT `project_skills_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `project_skills` ADD CONSTRAINT `project_skills_skillId_fkey` FOREIGN KEY (`skillId`) REFERENCES `skills`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `applications` ADD CONSTRAINT `applications_freelancerId_fkey` FOREIGN KEY (`freelancerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `invitations` ADD CONSTRAINT `invitations_freelancerId_fkey` FOREIGN KEY (`freelancerId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_clientId_fkey` FOREIGN KEY (`clientId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `contracts` ADD CONSTRAINT `contracts_freelancerId_fkey` FOREIGN KEY (`freelancerId`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `deliveries` ADD CONSTRAINT `deliveries_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `delivery_files` ADD CONSTRAINT `delivery_files_deliveryId_fkey` FOREIGN KEY (`deliveryId`) REFERENCES `deliveries`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wallets` ADD CONSTRAINT `wallets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `transactions` ADD CONSTRAINT `transactions_walletId_fkey` FOREIGN KEY (`walletId`) REFERENCES `wallets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `payments` ADD CONSTRAINT `payments_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `withdrawals` ADD CONSTRAINT `withdrawals_transactionId_fkey` FOREIGN KEY (`transactionId`) REFERENCES `transactions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_members` ADD CONSTRAINT `conversation_members_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `conversation_members` ADD CONSTRAINT `conversation_members_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_conversationId_fkey` FOREIGN KEY (`conversationId`) REFERENCES `conversations`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `messages` ADD CONSTRAINT `messages_replyToId_fkey` FOREIGN KEY (`replyToId`) REFERENCES `messages`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notifications` ADD CONSTRAINT `notifications_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_contractId_fkey` FOREIGN KEY (`contractId`) REFERENCES `contracts`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_clientReviewerId_fkey` FOREIGN KEY (`clientReviewerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_clientTargetId_fkey` FOREIGN KEY (`clientTargetId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_freelancerReviewerId_fkey` FOREIGN KEY (`freelancerReviewerId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reviews` ADD CONSTRAINT `reviews_freelancerTargetId_fkey` FOREIGN KEY (`freelancerTargetId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_targetUserId_fkey` FOREIGN KEY (`targetUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `favorites` ADD CONSTRAINT `favorites_projectId_fkey` FOREIGN KEY (`projectId`) REFERENCES `projects`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reporterId_fkey` FOREIGN KEY (`reporterId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `reports` ADD CONSTRAINT `reports_reportedUserId_fkey` FOREIGN KEY (`reportedUserId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tickets` ADD CONSTRAINT `tickets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_ticketId_fkey` FOREIGN KEY (`ticketId`) REFERENCES `tickets`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ticket_messages` ADD CONSTRAINT `ticket_messages_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolios` ADD CONSTRAINT `portfolios_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `portfolio_files` ADD CONSTRAINT `portfolio_files_portfolioId_fkey` FOREIGN KEY (`portfolioId`) REFERENCES `portfolios`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `experiences` ADD CONSTRAINT `experiences_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `educations` ADD CONSTRAINT `educations_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `certificates` ADD CONSTRAINT `certificates_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_languages` ADD CONSTRAINT `user_languages_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `audit_logs` ADD CONSTRAINT `audit_logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `password_resets` ADD CONSTRAINT `password_resets_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
