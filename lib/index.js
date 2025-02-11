var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });
var __export = (target, all) => {
  for (var name2 in all)
    __defProp(target, name2, { get: all[name2], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  Config: () => Config,
  apply: () => apply,
  imageTagApi: () => imageTagApi,
  name: () => name,
  usage: () => usage
});
module.exports = __toCommonJS(src_exports);
var import_koishi = require("koishi");
var name = "sexy-pic-lizard";
var usage = `
## 随机SFW/NSFW图片，内含超多tag:

<details>

### 支持的SFW-tags:
- holo、neko、kemonomimi、kanna、gah、coffee、food
### 支持的NSFW-tags:
- hass、hmidriff、pgif、4k、hentai、hneko、hkitsune、hanal、ass、thigh、hthigh、paizuri、boobs、hboobs
### 以下tags过于重口或过于真实，请酌情使用:
- anal、gonewild、pussy、tentacle
### 我超，有男同:
- yaoi
</details>

## 主要功能的示例调用
<details>

  - 示例指令：pic
    - 返回随机选取的tag的图片

  - 示例指令：pic -c 5 holo
    - 返回 holo (赫萝) tag 的 5 张图片

  - 示例指令：pic 天王盖地虎
    - 无效tag，返回已开启的可用的tag

  - 示例指令：tags
    - 返回已开启的可用的tag

</details>

`;
var sfwTags = ["holo", "neko", "kemonomimi", "kanna", "gah", "coffee", "food"];
var nsfwTags = ["hass", "hmidriff", "pgif", "4k", "hentai", "hneko", "hkitsune", "hanal", "ass", "thigh", "hthigh", "paizuri", "boobs", "hboobs"];
var extremeTags = ["anal", "gonewild", "pussy", "tentacle"];
var blTags = ["yaoi"];
function getRandomTag(tags) {
  const randomIndex = Math.floor(Math.random() * tags.length);
  return tags[randomIndex];
}
__name(getRandomTag, "getRandomTag");
var Config = import_koishi.Schema.object({
  apiUrl: import_koishi.Schema.string().default("https://nekobot.xyz/api").description("默认API请勿更改"),
  enableSfwTags: import_koishi.Schema.boolean().default(true).description("是否启用SFW标签"),
  enableNsfwTags: import_koishi.Schema.boolean().default(true).description("是否启用NSFW标签"),
  enableExtremeTags: import_koishi.Schema.boolean().default(false).description("是否启用重口标签"),
  enableBlTags: import_koishi.Schema.boolean().default(false).description("你是男同吗"),
  enableForward: import_koishi.Schema.boolean().default(false).description("是否开启合并转发功能")
});
var imageTagApi = "/image?type=";
function apply(ctx) {
  const logger = ctx.logger("sexy-pic-lizard");
  function getEnabledTags(config) {
    const enabledTags = [];
    if (config.enableSfwTags) {
      enabledTags.push(...sfwTags);
    }
    if (config.enableNsfwTags) {
      enabledTags.push(...nsfwTags);
    }
    if (config.enableExtremeTags) {
      enabledTags.push(...extremeTags);
    }
    if (config.enableBlTags) {
      enabledTags.push(...blTags);
    }
    return enabledTags;
  }
  __name(getEnabledTags, "getEnabledTags");
  function formatTags(enabledTags) {
    const formattedTags = {
      "SFW 标签": [],
      "NSFW 标签": [],
      "重口味标签": [],
      "BL 标签": []
    };
    enabledTags.forEach((tag) => {
      if (sfwTags.includes(tag)) {
        formattedTags["SFW 标签"].push(tag);
      } else if (nsfwTags.includes(tag)) {
        formattedTags["NSFW 标签"].push(tag);
      } else if (extremeTags.includes(tag)) {
        formattedTags["重口味标签"].push(tag);
      } else if (blTags.includes(tag)) {
        formattedTags["BL 标签"].push(tag);
      }
    });
    return Object.entries(formattedTags).filter(([, tags]) => tags.length > 0).map(([category, tags]) => `${category}: ${tags.join(", ")}`).join("\n\n");
  }
  __name(formatTags, "formatTags");
  function isValidTag(tag, enabledTags) {
    return enabledTags.includes(tag);
  }
  __name(isValidTag, "isValidTag");
  const picCommand = ctx.command("pic", "获取随机SFW/NSFW图片");
  picCommand.subcommand(".tag", "显示支持的标签").action(({ session }) => {
    const enabledTags = getEnabledTags(ctx.config);
    const formattedTagList = formatTags(enabledTags);
    return `开启的标签如下:
${formattedTagList}`;
  });
  picCommand.subcommand(".获取", "获取随机SFW/NSFW图片,根据可选参数最多10张").option("tag", "-t <tag:string>").option("count", "-c <count:number>", { fallback: 1 }).action(async ({ session, options }, tag) => {
    const enabledTags = getEnabledTags(ctx.config);
    const selectedTag = tag || options.tag || getRandomTag(enabledTags);
    const count = Math.min(Math.max(options.count, 1), 10);
    if (!isValidTag(selectedTag, enabledTags)) {
      const formattedTagList = formatTags(enabledTags);
      return `不支持的标签: ${selectedTag}
请使用以下分类的标签之一:
${formattedTagList}`;
    }
    const apiUrl = ctx.config.apiUrl + imageTagApi + selectedTag;
    try {
      const imagePromises = Array.from({ length: count }, async () => {
        const response = await ctx.http.get(apiUrl);
        const { success, message } = response;
        if (success && message) {
          return message;
        } else {
          return null;
        }
      });
      const images = await Promise.all(imagePromises);
      const validImages = images.filter((image) => image);
      if (validImages.length > 0) {
        if (ctx.config.enableForward) {
          const forwardMessages = validImages.map((imageUrl) => {
            const attrs = {
              userId: session.userId,
              nickname: session.username || "用户"
            };
            return (0, import_koishi.h)("message", attrs, import_koishi.h.image(imageUrl));
          });
          const forwardMessage = (0, import_koishi.h)("message", { forward: true, children: forwardMessages });
          await session.send(forwardMessage);
        } else {
          for (const imageUrl of validImages) {
            await session.send(import_koishi.h.image(imageUrl));
          }
        }
      } else {
        logger.warn("未能获取到有效的图片");
        return "未能获取到有效的图片，请稍后再试。";
      }
    } catch (error) {
      logger.error(`请求失败: ${error.message}`);
      return "请求失败，请检查API或网络连接。";
    }
  });
}
__name(apply, "apply");
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  Config,
  apply,
  imageTagApi,
  name,
  usage
});
