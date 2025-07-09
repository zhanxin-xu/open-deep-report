# Open Deep Report

基于 LangChain 和 LangGraph 构建的智能深度研究报告生成系统

## 📋 项目简介

Open Deep Report 是一个自动化的研究报告生成系统，通过智能规划和执行流程，能够自动进行深度研究并生成高质量的研究报告。系统采用分层架构设计，确保研究过程的系统性和完整性。

## ✨ 核心特性

- 🧠 **智能规划**: 自动制定研究路径和执行步骤
- 🔍 **深度搜索**: 多源网络搜索与信息聚合
- 📊 **内容评估**: 智能评估搜索内容的完整性
- 📝 **报告生成**: 自动生成结构化的研究报告
- 🔄 **迭代优化**: 动态补充缺失内容，确保报告完整性

## 🏗️ 系统架构

系统采用两层架构设计：

### 1. 规划层 (Plan Layer)
- **路径规划**: 根据研究主题制定详细的研究路径
- **最终报告生成**: 根据研究路径生成最终报告

### 2. 执行层 (Exec Layer)
- **任务拆分**: 识别并拆分研究空白点 (Gaps)
- **网络搜索**: 多渠道信息搜索与获取
- **内容评估**: 交叉验证搜索结果的相关性和完整性（如果缺少内容则追加Gaps）
- **报告生成**: 生成分段报告和完整研究报告

## 🚀 快速开始

### 环境要求

- Node.js >= 16.0.0
- pnpm (推荐) 或 npm

### 安装

```bash
# 克隆项目
git clone <repository-url>
cd open-deep-report

# 安装依赖
pnpm install
```

### 基本使用

```typescript
import { OpenDeepReport } from './src';

// 创建研究实例
const report = new OpenDeepReport();

// 开始研究
const result = await report.generate({
  topic: "人工智能在医疗领域的应用",
  depth: "deep",
  language: "zh-CN"
});

console.log(result);
```

## 🛠️ 开发指南

### 项目结构

```
open-deep-report/
├── src/
│   ├── index.ts            # 主入口文件
│   ├── plan/               # 规划层模块
│   │   ├── planner.ts      # 研究规划器
│   │   └── generator.ts    # 报告生成器
│   └── exec/               # 执行层模块
│       ├── gap_splitter.ts # 任务拆分器
│       ├── searcher.ts     # 搜索引擎
│       ├── evaluator.ts    # 内容评估器
│       └── generator.ts    # 报告生成器
├── package.json
└── README.md
```

### 开发脚本

```bash
# 开发模式
pnpm dev

# 构建项目
pnpm build

# 运行测试
pnpm test

# 代码检查
pnpm lint
```

## 🤝 贡献指南

我们欢迎所有形式的贡献！请遵循以下步骤：

1. Fork 本项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 ISC 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 🔗 相关链接

- [LangChain 文档](https://docs.langchain.com/)
- [LangGraph 文档](https://langchain-ai.github.io/langgraph/)

## 📧 联系我们

如有问题或建议，请通过以下方式联系：

- 提交 Issue
- 发送邮件至: [your-email@example.com]

---

⭐ 如果这个项目对您有帮助，请给我们一个 Star！