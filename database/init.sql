-- PromptHub 数据库初始化脚本
-- 创建数据库和表结构

-- 创建数据库（如果不存在）
CREATE DATABASE IF NOT EXISTS `prompthub` 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE `prompthub`;

-- 创建项目表
CREATE TABLE IF NOT EXISTS `projects` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL UNIQUE,
    `description` TEXT NULL,
    `default_branch` VARCHAR(191) NOT NULL DEFAULT 'main',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`id`),
    INDEX `projects_name_idx` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建分支表
CREATE TABLE IF NOT EXISTS `branches` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `project_id` VARCHAR(191) NOT NULL,
    `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
    `last_commit_id` VARCHAR(191) NULL,
    `created_from_commit_id` VARCHAR(191) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `unique_branch_per_project` (`project_id`, `name`),
    INDEX `branches_project_id_idx` (`project_id`),
    INDEX `branches_last_commit_id_idx` (`last_commit_id`),
    
    CONSTRAINT `branches_project_id_fkey` 
        FOREIGN KEY (`project_id`) REFERENCES `projects` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 创建提交表
CREATE TABLE IF NOT EXISTS `commits` (
    `id` VARCHAR(191) NOT NULL,
    `message` VARCHAR(500) NOT NULL,
    `content` LONGTEXT NOT NULL,
    `branch_id` VARCHAR(191) NOT NULL,
    `parent_commit_id` VARCHAR(191) NULL,
    `commit_hash` VARCHAR(64) NOT NULL UNIQUE,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    
    PRIMARY KEY (`id`),
    UNIQUE KEY `commits_commit_hash_key` (`commit_hash`),
    INDEX `commits_branch_id_idx` (`branch_id`),
    INDEX `commits_commit_hash_idx` (`commit_hash`),
    INDEX `commits_created_at_idx` (`created_at`),
    
    CONSTRAINT `commits_branch_id_fkey` 
        FOREIGN KEY (`branch_id`) REFERENCES `branches` (`id`) 
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT `commits_parent_commit_id_fkey` 
        FOREIGN KEY (`parent_commit_id`) REFERENCES `commits` (`id`) 
        ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 添加分支表的外键约束（在commits表创建后）
ALTER TABLE `branches` 
ADD CONSTRAINT `branches_last_commit_id_fkey` 
    FOREIGN KEY (`last_commit_id`) REFERENCES `commits` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE,
ADD CONSTRAINT `branches_created_from_commit_id_fkey` 
    FOREIGN KEY (`created_from_commit_id`) REFERENCES `commits` (`id`) 
    ON DELETE SET NULL ON UPDATE CASCADE;

-- 插入示例数据
-- 创建示例项目
INSERT INTO `projects` (`id`, `name`, `description`, `default_branch`, `created_at`, `updated_at`) 
VALUES 
(
    UUID(), 
    '示例提示词项目', 
    '这是一个示例项目，展示如何使用PromptHub管理提示词',
    'main',
    NOW(3),
    NOW(3)
);

-- 获取刚创建的项目ID（需要在实际执行时替换）
SET @project_id = (SELECT `id` FROM `projects` WHERE `name` = '示例提示词项目' LIMIT 1);

-- 创建默认分支
INSERT INTO `branches` (`id`, `name`, `project_id`, `is_default`, `created_at`, `updated_at`) 
VALUES 
(
    UUID(), 
    'main', 
    @project_id, 
    TRUE,
    NOW(3),
    NOW(3)
);

-- 获取分支ID
SET @branch_id = (SELECT `id` FROM `branches` WHERE `project_id` = @project_id AND `name` = 'main' LIMIT 1);

-- 创建初始提交
SET @initial_content = '# 欢迎使用PromptHub

这是一个示例提示词，展示如何编写高质量的AI提示词。

## 写作助手提示词

你是一个专业的写作助手，请帮助用户：
1. 改善文章结构
2. 优化语言表达
3. 检查语法错误
4. 提供创意建议

请始终保持友好、专业的态度。';

INSERT INTO `commits` (`id`, `message`, `content`, `branch_id`, `commit_hash`, `created_at`) 
VALUES 
(
    UUID(), 
    '初始提交：添加示例提示词', 
    @initial_content, 
    @branch_id, 
    SHA2(CONCAT(@initial_content, UNIX_TIMESTAMP(NOW(3))), 256),
    NOW(3)
);

-- 获取提交ID并更新分支
SET @commit_id = (SELECT `id` FROM `commits` WHERE `branch_id` = @branch_id ORDER BY `created_at` DESC LIMIT 1);

UPDATE `branches` 
SET `last_commit_id` = @commit_id, `updated_at` = NOW(3) 
WHERE `id` = @branch_id;

-- 创建第二个提交
SET @updated_content = '# 欢迎使用PromptHub

这是一个示例提示词，展示如何编写高质量的AI提示词。

## 写作助手提示词

你是一个专业的写作助手，请帮助用户：
1. 改善文章结构
2. 优化语言表达  
3. 检查语法错误
4. 提供创意建议
5. 分析文章逻辑性

请始终保持友好、专业的态度，并提供具体的改进建议。

## 示例对话
用户：请帮我修改这段文字
助手：我很乐意帮您修改文字。请提供您需要修改的内容，我会从结构、表达、语法等方面给出建议。';

INSERT INTO `commits` (`id`, `message`, `content`, `branch_id`, `parent_commit_id`, `commit_hash`, `created_at`) 
VALUES 
(
    UUID(), 
    '优化提示词：添加示例对话和更多功能', 
    @updated_content, 
    @branch_id, 
    @commit_id,
    SHA2(CONCAT(@updated_content, UNIX_TIMESTAMP(NOW(3))), 256),
    NOW(3)
);

-- 获取新提交ID并更新分支
SET @new_commit_id = (SELECT `id` FROM `commits` WHERE `branch_id` = @branch_id ORDER BY `created_at` DESC LIMIT 1);

UPDATE `branches` 
SET `last_commit_id` = @new_commit_id, `updated_at` = NOW(3) 
WHERE `id` = @branch_id;

-- 显示创建结果
SELECT '数据库初始化完成！' AS message;
SELECT COUNT(*) AS project_count FROM `projects`;
SELECT COUNT(*) AS branch_count FROM `branches`;
SELECT COUNT(*) AS commit_count FROM `commits`;

-- 显示创建的数据
SELECT 
    p.name AS project_name,
    b.name AS branch_name,
    c.message AS commit_message,
    c.created_at
FROM `projects` p
JOIN `branches` b ON p.id = b.project_id
JOIN `commits` c ON b.id = c.branch_id
ORDER BY c.created_at;
