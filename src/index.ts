import { Context, Schema, h } from 'koishi';
// npm publish --workspace koishi-plugin-sexy-pic-lizard --access public --registry https://registry.npmjs.org
export const name = 'sexy-pic-lizard';

export const usage = `
# ⚠️ NSFW 警告!!!  
## **随机获取 SFW/NSFW 图片，支持多种分类标签**  
插件提供丰富的 SFW/NSFW 图片资源，支持多种标签选择。  

---

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">📌 支持的标签列表</span></strong></summary>

### ✅ **SFW 标签（适合所有人）**
- \`holo\`、\`neko\`、\`kemonomimi\`、\`kanna\`、\`gah\`、\`coffee\`、\`food\`

### 🔞 **NSFW 标签（请注意环境）**
- \`hass\`、\`hmidriff\`、\`pgif\`、\`4k\`、\`hentai\`、\`hneko\`、\`hkitsune\`、\`hanal\`
- \`ass\`、\`thigh\`、\`hthigh\`、\`paizuri\`、\`boobs\`、\`hboobs\`

### ⚠ **重口味标签（请酌情使用）**
- \`anal\`、\`gonewild\`、\`pussy\`、\`tentacle\`

### 🏳️‍🌈 **你是男同吗？（BL 向）**
- \`yaoi\`

</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">📜 使用方法</span></strong></summary>

### **随机获取图片**
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">pic // 获取随机图片</pre>

### **指定标签获取图片**
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">pic boobs // 获取 boobs 图片</pre>

### **获取多张图片**
#### 示例：
<pre style="background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;">pic boobs -c 5 // 获取 5 张 boobs 图片</pre>

</details>

---

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果要反馈建议或报告问题</span></strong></summary>

<strong>可以[点这里](https://github.com/lizard0126/javbus-lizard/issues)创建议题~</strong>
</details>

<details>
<summary><strong><span style="font-size: 1.3em; color: #2a2a2a;">如果喜欢我的插件</span></strong></summary>

<strong>可以[请我喝可乐](https://ifdian.net/a/lizard0126)，没准就有动力更新新功能了~</strong>
</details>
`;


const tagCategories = {
  sfw: ['holo', 'neko', 'kemonomimi', 'kanna', 'gah', 'coffee', 'food'],
  nsfw: ['hass', 'hmidriff', 'pgif', '4k', 'hentai', 'hneko', 'hkitsune', 'hanal', 'ass', 'thigh', 'hthigh', 'paizuri', 'boobs', 'hboobs'],
  extreme: ['anal', 'gonewild', 'pussy', 'tentacle'],
  bl: ['yaoi'],
};

export const Config = Schema.object({
  enableSfwTags: Schema.boolean().default(true).description('是否启用SFW标签'),
  enableNsfwTags: Schema.boolean().default(true).description('是否启用NSFW标签'),
  enableExtremeTags: Schema.boolean().default(false).description('是否启用重口标签'),
  enableBlTags: Schema.boolean().default(false).description('你是男同吗'),
  enableForward: Schema.boolean().default(true).description('是否开启合并转发功能'),
});

export function apply(ctx: Context) {
  function getEnabledTags(config, random = false): string | string[] {
    const enabledTags: string[] = [];
    if (config.enableSfwTags) enabledTags.push(...tagCategories.sfw);
    if (config.enableNsfwTags) enabledTags.push(...tagCategories.nsfw);
    if (config.enableExtremeTags) enabledTags.push(...tagCategories.extreme);
    if (config.enableBlTags) enabledTags.push(...tagCategories.bl);
    return random ? enabledTags[Math.floor(Math.random() * enabledTags.length)] : enabledTags;
  }

  async function fetchImage(url: string, referer: string): Promise<string> {
    const imageBuffer = await ctx.http.get(url, {
      headers: { referer },
      responseType: 'arraybuffer'
    });
    return `data:image/jpeg;base64,${Buffer.from(imageBuffer).toString('base64')}`;
  }

  async function forward(session, messages, userId) {
    const bot = await session.bot;
    const userInfo = await bot.getUser(userId);
    const nickname = userInfo.username;
    const messageCount = messages.length;

    const [tipMessageId] = await session.send(`共 ${messageCount} 条消息合并转发中...`);

    const forwardMessages = await Promise.all(
      messages.map(async (msg) => {
        const attrs = { userId, nickname };
        const imageData = await fetchImage(msg.src, msg.referer);
        return h('message', attrs, msg.text ? `${msg.text}\n` : '', h.image(imageData));
      })
    );

    try {
      await session.send(h('message', { forward: true, children: forwardMessages }));
      await session.bot.deleteMessage(session.channelId, tipMessageId);
    } catch (error) {
      await session.send(`合并转发消息发送失败: ${error}`);
      await session.bot.deleteMessage(session.channelId, tipMessageId);
    }
  }

  ctx.command('pic', '获取随机SFW/NSFW图片')
    .option('tag', '-t <tag:string>')
    .option('count', '-c <count:number>', { fallback: 3 })
    .action(async ({ session, options }, tag) => {
      const enabledTags = getEnabledTags(ctx.config) as string[];
      const selectedTag = tag || options.tag || getEnabledTags(ctx.config, true) as string;
      const count = Math.min(Math.max(options.count, 1), 10);

      if (!enabledTags.includes(selectedTag)) {
        return `不支持 ${selectedTag} 标签！\n请使用以下可用标签之一：\n${enabledTags.join(', ')}`;
      }

      const apiUrl = `https://nekobot.xyz/api/image?type=${selectedTag}`;
      try {
        const urlResults = await Promise.allSettled(
          Array.from({ length: count }, () => ctx.http.get(apiUrl).then(res => res.message))
        );
        const imageUrls = urlResults
          .filter(res => res.status === 'fulfilled')
          .map(res => (res as PromiseFulfilledResult<string>).value);

        if (imageUrls.length === 0) {
          return '请求失败，请检查API或网络连接。';
        }
        
        if (ctx.config.enableForward) {
          await forward(session, imageUrls.map(url => ({ src: url, referer: apiUrl })), session.userId);
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