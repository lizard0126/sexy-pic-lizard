import { Context, Schema, h } from 'koishi';

export const name = 'sexy-pic-lizard';

const tagCategories = {
  sfw: ['holo', 'neko', 'kemonomimi', 'kanna', 'gah', 'coffee', 'food'],
  nsfw: ['hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'hkitsune', 'hanal', 'ass', 'thigh', 'hthigh', 'paizuri', 'boobs', 'hboobs'],
  extreme: ['anal', 'gonewild', 'pussy', 'tentacle'],
  bl: ['yaoi'],
};

const buildTagDoc = () => Object.entries(tagCategories)
  .map(([key, tags]) => {
    const title = key === 'sfw' ? 'SFW'
      : key === 'nsfw' ? 'NSFW'
        : key === 'extreme' ? '重口味'
          : 'BL';
    return `### ${title}\n- ${tags.join('、')}`;
  }).join('\n\n');

export const usage = `
# ⚠️ NSFW 警告!!!  
## **随机获取 SFW/NSFW 图片，支持多种分类标签**  

---

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">支持的标签列表</span></strong></summary>

${buildTagDoc()}

</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">使用方法</span></strong></summary>

### **随机获取图片**
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">pic // 获取随机图片</pre>

### **指定标签获取图片**
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">pic boobs // 获取 boobs 图片</pre>

### **获取多张图片**
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">pic boobs -c 5 // 获取 5 张 boobs 图片（不输入则默认5张，可通过配置修改</pre>

</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果要反馈建议或报告问题</span></strong></summary>

<strong>可以[点这里](https://github.com/lizard0126/sexy-pic-lizard/issues)创建议题~</strong>
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果喜欢我的插件</span></strong></summary>

<strong>可以[请我喝可乐](https://ifdian.net/a/lizard0126)，没准就有动力更新新功能了~</strong>
</details>
`

export const Config = Schema.object({
  Sfw: Schema.boolean().default(true).description('是否启用SFW标签'),
  Nsfw: Schema.boolean().default(true).description('是否启用NSFW标签'),
  Extreme: Schema.boolean().default(false).description('是否启用重口标签'),
  Bl: Schema.boolean().default(false).description('你是男同吗'),
  enableForward: Schema.boolean().default(true).description('是否合并转发（仅适配onebot平台，其他平台请勿开启）'),
  defaultCount: Schema.number().default(5).min(1)
    .description('每次默认获取的图片数量（建议不超过10张）'),
});

export function apply(ctx: Context) {
  function getEnabledTags(config, random = false) {
    const enabledTags = Object.entries(tagCategories)
      .filter(([key]) => {
        if (key === 'sfw') return config.Sfw;
        if (key === 'nsfw') return config.Nsfw;
        if (key === 'extreme') return config.Extreme;
        if (key === 'bl') return config.Bl;
        return false;
      })
      .flatMap(([, tags]) => tags);

    return random
      ? enabledTags[Math.floor(Math.random() * enabledTags.length)]
      : enabledTags;
  }

  async function fetchImage(url, referer) {
    try {
      const imageBuffer = await ctx.http.get(url, { headers: { referer }, responseType: 'arraybuffer' });
      return `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
    } catch {
      ctx.logger.error('图片获取失败：', url);
    }
  }

  async function forward(session, messages) {
    const bot = await session.bot;
    const platform = bot.platform;
    const [tipMessageId] = await session.send(`共 ${messages.length} 条消息合并转发中...`);

    if (platform === 'onebot') {
      try {
        const UserInfo = await bot.getUser(session.userId);
        const nickname: string = UserInfo.username;

        const forwardMessages = await Promise.all(
          messages.map(async (msg) => {
            const attrs = { userId: session.userId, nickname: nickname };

            const imageData = await fetchImage(msg.src, msg.referer);
            return h('message', attrs, h.image(imageData));
          })
        );

        const forwardMessage = h('message', {
          forward: true,
          children: forwardMessages
        });

        await session.send(forwardMessage);
        await session.bot.deleteMessage(session.channelId, tipMessageId);

      } catch (error) {
        await session.send(`合并转发消息发送失败`);
        ctx.logger.error(error);
        await session.bot.deleteMessage(session.channelId, tipMessageId);
      }

    } else {
      await session.send(`当前平台（${platform}）暂不支持合并转发功能。`);
      await bot.deleteMessage(session.channelId, tipMessageId);
    }
  }

  ctx.command('pic', '获取随机SFW/NSFW图片')
    .option('tag', '-t <tag:string>')
    .option('count', '-c <count:number>')
    .action(async ({ session, options }, tag) => {
      const enabledTags = getEnabledTags(ctx.config) as string[];
      const selectedTag = tag || options.tag || getEnabledTags(ctx.config, true) as string;
      const count = options.count || ctx.config.defaultCount

      if (!enabledTags.includes(selectedTag)) {
        return h('quote', session.messageId) +
          `不支持标签「${selectedTag}」。\n可用标签：${enabledTags.join(', ')}`
      }

      const apiUrl = `https://nekobot.xyz/api/image?type=${selectedTag}`;
      try {
        const imageUrls = (
          await Promise.allSettled(
            Array.from({ length: count }, () => ctx.http.get(apiUrl).then(res => res.message))
          )
        ).flatMap(res => (res.status === 'fulfilled' ? [res.value] : []));

        if (imageUrls.length === 0) {
          return '请求失败，请检查API或网络连接。';
        }

        if (ctx.config.enableForward) {
          await forward(session, imageUrls.map(url => ({ src: url, referer: apiUrl })));
        } else {
          await Promise.all(
            imageUrls.map(async (url) => session.send(h.image(await fetchImage(url, apiUrl))))
          );
        }
      } catch (error) {
        return '请求失败！';
      }
    });
}