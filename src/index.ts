import { Context, Schema, h } from 'koishi';

// npm publish --workspace koishi-plugin-sexy-pic-lizard --access public --registry https://registry.npmjs.org
export const name = 'sexy-pic-lizard';

export const usage = `
# 随机SFW/NSFW图片，内含超多tag
## 支持的SFW-tags:
- holo、neko、kemonomimi、kanna、gah、coffee、food
## 支持的NSFW-tags:
- hass、hmidriff、pgif、4k、hentai、hneko、hkitsune、hanal、ass、thigh、hthigh、paizuri、boobs、hboobs
## 以下tags过于重口或过于真实，请酌情使用:
- anal、gonewild、pussy、tentacle
## 我超，有男同:
- yaoi

# 主要功能的示例调用
  - 示例指令：pic
    - 返回随机选取的tag的图片

  - 示例指令：pic -c 5 holo
    - 返回 holo (赫萝) tag 的 5 张图片

  - 示例指令：pic 天王盖地虎
    - 无效tag，返回已开启的可用的tag

  - 示例指令：tags
    - 返回已开启的可用的tag
`;

const sfwTags = ['holo', 'neko', 'kemonomimi', 'kanna', 'gah', 'coffee', 'food'];
const nsfwTags = ['hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'hkitsune', 'hanal', 'ass', 'thigh', 'hthigh', 'paizuri', 'boobs', 'hboobs'];
const extremeTags = ['anal', 'gonewild', 'pussy', 'tentacle'];
const blTags = ['yaoi'];

function getRandomTag(tags: string[]) {
  const randomIndex = Math.floor(Math.random() * tags.length);
  return tags[randomIndex];
}

export interface Config {
  apiUrl: string;
  enableSfwTags: boolean;
  enableNsfwTags: boolean;
  enableExtremeTags: boolean;
  enableBlTags: boolean;
  enableForward: boolean;
}

export const Config = Schema.object({
  apiUrl: Schema.string()
    .default('https://nekobot.xyz/api')
    .description('默认API请勿更改'),
  enableSfwTags: Schema.boolean()
    .default(true)
    .description('是否启用SFW标签'),
  enableNsfwTags: Schema.boolean()
    .default(true)
    .description('是否启用NSFW标签'),
  enableExtremeTags: Schema.boolean()
    .default(false)
    .description('是否启用重口标签'),
  enableBlTags: Schema.boolean()
    .default(false)
    .description('你是男同吗'),
  enableForward: Schema.boolean()
    .default(false)
    .description('是否开启合并转发功能'),
});

export const imageTagApi = '/image?type=';

export function apply(ctx: Context) {
  const logger = ctx.logger('sexy-pic-lizard');

  function getEnabledTags(config: Config) {
    const enabledTags: string[] = [];
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

  function formatTags(enabledTags: string[]) {
    const formattedTags: { [key: string]: string[] } = {
      'SFW 标签': [],
      'NSFW 标签': [],
      '重口味标签': [],
      'BL 标签': [],
    };

    enabledTags.forEach(tag => {
      if (sfwTags.includes(tag)) {
        formattedTags['SFW 标签'].push(tag);
      } else if (nsfwTags.includes(tag)) {
        formattedTags['NSFW 标签'].push(tag);
      } else if (extremeTags.includes(tag)) {
        formattedTags['重口味标签'].push(tag);
      } else if (blTags.includes(tag)) {
        formattedTags['BL 标签'].push(tag);
      }
    });

    const formattedList = Object.entries(formattedTags)
      .filter(([, tags]) => tags.length > 0)
      .map(([category, tags]) => `${category}: ${tags.join(', ')}`)
      .join('\n\n');
    
    logger.info(`格式化后的标签列表:\n${formattedList}`);
    return formattedList;
  }

  function isValidTag(tag: string, enabledTags: string[]) {
    const isValid = enabledTags.includes(tag);
    return isValid;
  }

  ctx.command('tags', '显示所有支持的标签')
    .action(({ session }) => {
      const enabledTags = getEnabledTags(ctx.config);
      const formattedTagList = formatTags(enabledTags);
      return `开启的标签如下:\n${formattedTagList}`;
    });

  ctx.command('pic <tag>', '获取随机SFW/NSFW图片,根据可选参数最多5张')
    .option('tag', '-t <tag:string>')
    .option('count', '-c <count:number>', { fallback: 1 })
    .action(async ({ session, options }, tag) => {
      const enabledTags = getEnabledTags(ctx.config);
      const selectedTag = tag || options.tag || getRandomTag(enabledTags);
      const count = Math.min(Math.max(options.count, 1), 5);

      logger.info(`选择的标签: ${selectedTag}, 请求的图片数量: ${count}`);

      if (!isValidTag(selectedTag, enabledTags)) {
        const formattedTagList = formatTags(enabledTags);
        return `不支持的标签: ${selectedTag}\n请使用以下分类的标签之一:\n${formattedTagList}`;
      }

      const apiUrl = ctx.config.apiUrl + imageTagApi + selectedTag;

      try {
        //logger.info(`开始发送 ${count} 个并发请求`);
        const imagePromises = Array.from({ length: count }, async () => {
          const response = await ctx.http.get(apiUrl);
          const { success, message } = response;

          if (success && message) {
            //logger.info('成功获取图片数据');
            return message;
          } else {
            //logger.error('API请求失败或未获取到图片数据');
            return null;
          }
        });

        const images: (string | null)[] = await Promise.all(imagePromises);
        const validImages = images.filter(image => image);
        //logger.info(`获取到有效图片数量: ${validImages.length}`);

        if (validImages.length > 0) {
          if (ctx.config.enableForward) {
            //logger.info('准备发送合并转发消息');
            const forwardMessages = validImages.map((imageUrl, index) => {
              const attrs = {
                userId: session.userId,
                nickname: session.username || '用户',
              };
              return h('message', attrs, h.image(imageUrl));
            });

            const forwardMessage = h('message', { forward: true, children: forwardMessages });
            await session.send(forwardMessage);
            //logger.info(`合并转发消息发送成功，图片数量: ${validImages.length}`);
          } else {
            logger.info('逐个发送图片');
            for (const imageUrl of validImages) {
              await session.send(h.image(imageUrl));
              logger.info(`发送图片: ${imageUrl}`);
            }
          }
        } else {
          logger.warn('未能获取到有效的图片');
          return '未能获取到有效的图片，请稍后再试。';
        }
      } catch (error) {
        logger.error(`请求失败: ${error.message}`);
        return '请求失败，请检查API或网络连接。';
      }
    });
}
