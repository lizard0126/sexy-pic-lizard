import { Context, Schema, h } from 'koishi'
// npm publish --workspace koishi-plugin-sexy-pic-lizard --access public --registry https://registry.npmjs.org
export const name = 'sexy-pic-lizard'

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
`

// 定义不同类别的tag
const sfwTags = ['holo', 'neko', 'kemonomimi', 'kanna', 'gah', 'coffee', 'food'];
const nsfwTags = ['hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'hkitsune', 'hanal', 'ass', 'thigh', 'hthigh', 'paizuri', 'boobs', 'hboobs'];
const extremeTags = ['anal', 'gonewild', 'pussy', 'tentacle'];
const blTags = ['yaoi'];

// 随机挑选一个支持的tag
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
})

export const imageTagApi = '/image?type=';

export function apply(ctx: Context) {
  const logger = ctx.logger('sexy-pic-lizard');

  function getEnabledTags(config: Config) {
    let enabledTags: string[] = [];

    if (config.enableSfwTags) {
      enabledTags = enabledTags.concat(sfwTags);
    }
    if (config.enableNsfwTags) {
      enabledTags = enabledTags.concat(nsfwTags);
    }
    if (config.enableExtremeTags) {
      enabledTags = enabledTags.concat(extremeTags);
    }
    if (config.enableBlTags) {
      enabledTags = enabledTags.concat(blTags);
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

    return Object.entries(formattedTags)
      .filter(([, tags]) => tags.length > 0)
      .map(([category, tags]) => `${category}: ${tags.join(', ')}`)
      .join('\n\n');
  }

  ctx.command('pic <tag>', '获取随机SFW/NSFW图片')
    .option('tag', '-t <tag:string>')  // 用户可以指定tag
    .action(async ({ session, options }, tag) => {
      const enabledTags = getEnabledTags(ctx.config);

      const selectedTag = tag || options.tag || getRandomTag(enabledTags);
      logger.info(`选择的标签: ${selectedTag}`);

      if (!enabledTags.includes(selectedTag)) {
        logger.warn(`标签不被启用或不支持: ${selectedTag}`);
        const formattedTagList = formatTags(enabledTags);
        return `不支持的标签: ${selectedTag}\n请使用以下分类的标签之一:\n${formattedTagList}`;
      }

      const apiUrl = ctx.config.apiUrl + imageTagApi + selectedTag;

      try {
        const response = await ctx.http.get(apiUrl);
        const { success, message } = response;

        if (success && message) {
          const imageBuffer = await ctx.http.get<ArrayBuffer>(message, { responseType: 'arraybuffer' });

          await session.send(h.image(imageBuffer, 'image/png'));
          logger.info('图片发送成功');
          return;
        } else {
          logger.error('API请求失败或未获取到图片数据');
          return '获取图片失败，请稍后再试。';
        }
      } catch (error) {
        logger.error('请求出现错误', error);
        return '请求失败，请检查API或网络连接。';
      }
    });
}
