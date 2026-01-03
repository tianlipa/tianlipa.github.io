---
title: CAMEL, RoleLLM
date: 2025-12-31 16:29:51
tags: [USTC-MINE, 论文阅读, 大模型]
---

## CAMEL: Communicative Agents for “Mind” Exploration of Large Language Model Society
让两个 LLM 互相对话, 人类提出idea, 由**任务细化员**把idea变成具体任务, 由**AI User**提需求并验收代码, **AI Assistant**写代码, 二者进行多轮对话.

容易出现的问题:

- 互换身份, 例如User开始写代码.
- 死循环对话.
- 偏离对话结构等.

解决方案: Inception Prompting.

值得注意的是, 这种方法可以用于生成效果出色的微调数据集.

<!--more-->

## RoleLLM: Benchmarking, Eliciting, and Enhancing Role-Playing Abilities of Large Language Model
现有的开源 LLM 主要是在通用领域训练的, 缺乏对角色扮演的特定优化; 闭源LLM如GPT4虽然角色扮演能力出色, 但闭源模型无法微调, API成本高, 上下文窗口有限.

以前的研究主要关注粗粒度的角色扮演, 例如程序员, 作家, 而非细粒度的扮演, 例如某个特定的虚拟角色.

设计原则:

- 说话风格满足词汇一致性, 生成内容不仅要符合上下文, 还应该与示例相似
- 角色的知识与记忆, 包括基于剧本的知识, 和角色应该具备的专业知识

角色档案包括人格描述, 口头禅和结构化的对话历史.

使用Context-Instruct进行长文本知识提取和指令生成. 具体步骤: 把长文本切分, 转换为{问题, 置信度, 答案}的三元组, 并过滤掉低质量数据.

使用GPT这样的闭源模型(RoleGPT)生成高质量角色扮演数据, 用于微调开源模型(RoCIT).

RoleBench: 包括通用指令和角色特有的知识.