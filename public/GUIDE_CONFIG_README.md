# Driver.js 引导配置说明

## 概述

现在 `driver-test.html` 页面使用 JSON 配置文件来管理引导步骤，这使得配置更加灵活和易于维护。

## 配置文件

- **配置文件路径**: `public/guide-config.json`
- **使用方式**: 页面会自动加载该配置文件并应用其中的设置

## JSON 配置结构

### 完整配置示例

```json
{
  "tourSteps": [
    {
      "element": "#welcomeCard",
      "popover": {
        "title": "欢迎使用",
        "description": "这是我们的欢迎卡片，包含主要的功能介绍和操作按钮。",
        "side": "bottom",
        "align": "center"
      }
    }
  ],
  "highlightSteps": [
    {
      "element": "#actionBtn2",
      "popover": {
        "title": "次要操作",
        "description": "这是次要操作按钮，用于辅助功能。",
        "showButtons": []
      }
    }
  ],
  "driverOptions": {
    "animate": true,
    "allowClose": true,
    "overlayClickBehavior": "next",
    "showProgress": true,
    "showButtons": ["next", "previous", "close"],
    "progressText": "步骤 {{current}} / {{total}}",
    "nextBtnText": "下一步",
    "prevBtnText": "上一步",
    "doneBtnText": "完成"
  }
}
```

### 配置字段说明

#### tourSteps (引导步骤数组)
- **element**: 要引导的DOM元素选择器
- **popover**: 弹窗配置
  - **title**: 弹窗标题
  - **description**: 弹窗描述
  - **side**: 弹窗位置 (top, bottom, left, right)
  - **align**: 对齐方式 (start, center, end)
  - **doneBtnText**: 完成按钮文本（仅最后一个步骤有效）

#### highlightSteps (高亮步骤数组)
- **element**: 要高亮的DOM元素选择器
- **popover**: 弹窗配置
  - **showButtons**: 显示的按钮数组，空数组表示不显示导航按钮

#### driverOptions (Driver.js 选项)
- **animate**: 是否启用动画效果
- **allowClose**: 是否允许关闭
- **overlayClickBehavior**: 覆盖层点击行为 (next, previous, close)
- **showProgress**: 是否显示进度
- **showButtons**: 显示的按钮数组
- **progressText**: 进度文本模板
- **按钮文本**: nextBtnText, prevBtnText, doneBtnText

## 使用方法

### 1. 修改引导步骤

编辑 `guide-config.json` 文件中的 `tourSteps` 数组来添加、删除或修改引导步骤。

### 2. 修改高亮步骤

编辑 `guide-config.json` 文件中的 `highlightSteps` 数组来配置高亮演示。

### 3. 自定义Driver.js选项

在 `driverOptions` 对象中修改Driver.js的各种配置选项。

### 4. 实时预览

修改配置文件后，刷新页面即可看到更改生效，无需修改HTML代码。

## 优势

1. **配置与代码分离**: 引导配置与HTML代码分离，便于维护
2. **易于修改**: 只需编辑JSON文件即可更改引导流程
3. **版本控制友好**: JSON文件易于版本控制和管理
4. **动态加载**: 支持运行时动态加载配置
5. **错误处理**: 如果JSON加载失败，会使用默认配置并显示错误提示

## 注意事项

- 确保JSON格式正确，可以使用在线JSON验证工具检查
- 元素选择器必须与HTML中的元素ID或类名匹配
- 如果配置加载失败，页面会显示错误提示并使用默认配置
- 支持热重载，修改配置文件后刷新页面即可生效