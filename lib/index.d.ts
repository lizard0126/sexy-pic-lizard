import { Context, Schema } from 'koishi';
export declare const name = "sexy-pic-lizard";
export declare const usage = "\n# \u26A0\uFE0F NSFW \u8B66\u544A!!!  \n## **\u968F\u673A\u83B7\u53D6 SFW/NSFW \u56FE\u7247\uFF0C\u652F\u6301\u591A\u79CD\u5206\u7C7B\u6807\u7B7E**  \n\u63D2\u4EF6\u63D0\u4F9B\u4E30\u5BCC\u7684 SFW/NSFW \u56FE\u7247\u8D44\u6E90\uFF0C\u652F\u6301\u591A\u79CD\u6807\u7B7E\u9009\u62E9\u3002  \n\n---\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\uD83D\uDCCC \u652F\u6301\u7684\u6807\u7B7E\u5217\u8868</span></strong></summary>\n\n### \u2705 **SFW \u6807\u7B7E\uFF08\u9002\u5408\u6240\u6709\u4EBA\uFF09**\n- `holo`\u3001`neko`\u3001`kemonomimi`\u3001`kanna`\u3001`gah`\u3001`coffee`\u3001`food`\n\n### \uD83D\uDD1E **NSFW \u6807\u7B7E\uFF08\u8BF7\u6CE8\u610F\u73AF\u5883\uFF09**\n- `hass`\u3001`hmidriff`\u3001`pgif`\u3001`4k`\u3001`hentai`\u3001`hneko`\u3001`hkitsune`\u3001`hanal`\n- `ass`\u3001`thigh`\u3001`hthigh`\u3001`paizuri`\u3001`boobs`\u3001`hboobs`\n\n### \u26A0 **\u91CD\u53E3\u5473\u6807\u7B7E\uFF08\u8BF7\u914C\u60C5\u4F7F\u7528\uFF09**\n- `anal`\u3001`gonewild`\u3001`pussy`\u3001`tentacle`\n\n### \uD83C\uDFF3\uFE0F\u200D\uD83C\uDF08 **\u4F60\u662F\u7537\u540C\u5417\uFF1F\uFF08BL \u5411\uFF09**\n- `yaoi`\n\n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\uD83D\uDCDC \u4F7F\u7528\u65B9\u6CD5</span></strong></summary>\n\n### **\u968F\u673A\u83B7\u53D6\u56FE\u7247**\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">pic // \u83B7\u53D6\u968F\u673A\u56FE\u7247</pre>\n\n### **\u6307\u5B9A\u6807\u7B7E\u83B7\u53D6\u56FE\u7247**\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">pic boobs // \u83B7\u53D6 boobs \u56FE\u7247</pre>\n\n### **\u83B7\u53D6\u591A\u5F20\u56FE\u7247**\n#### \u793A\u4F8B\uFF1A\n<pre style=\"background-color: #f4f4f4; padding: 10px; border-radius: 4px; border: 1px solid #ddd;\">pic boobs -c 5 // \u83B7\u53D6 5 \u5F20 boobs \u56FE\u7247</pre>\n\n</details>\n\n---\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u5982\u679C\u8981\u53CD\u9988\u5EFA\u8BAE\u6216\u62A5\u544A\u95EE\u9898</span></strong></summary>\n\n<strong>\u53EF\u4EE5[\u70B9\u8FD9\u91CC](https://github.com/lizard0126/javbus-lizard/issues)\u521B\u5EFA\u8BAE\u9898~</strong>\n</details>\n\n<details>\n<summary><strong><span style=\"font-size: 1.3em; color: #2a2a2a;\">\u5982\u679C\u559C\u6B22\u6211\u7684\u63D2\u4EF6</span></strong></summary>\n\n<strong>\u53EF\u4EE5[\u8BF7\u6211\u559D\u53EF\u4E50](https://ifdian.net/a/lizard0126)\uFF0C\u6CA1\u51C6\u5C31\u6709\u52A8\u529B\u66F4\u65B0\u65B0\u529F\u80FD\u4E86~</strong>\n</details>\n";
export interface Config {
    apiUrl: string;
    enableSfwTags: boolean;
    enableNsfwTags: boolean;
    enableExtremeTags: boolean;
    enableBlTags: boolean;
    enableForward: boolean;
}
export declare const Config: Schema<Schemastery.ObjectS<{
    apiUrl: Schema<string, string>;
    enableSfwTags: Schema<boolean, boolean>;
    enableNsfwTags: Schema<boolean, boolean>;
    enableExtremeTags: Schema<boolean, boolean>;
    enableBlTags: Schema<boolean, boolean>;
    enableForward: Schema<boolean, boolean>;
}>, Schemastery.ObjectT<{
    apiUrl: Schema<string, string>;
    enableSfwTags: Schema<boolean, boolean>;
    enableNsfwTags: Schema<boolean, boolean>;
    enableExtremeTags: Schema<boolean, boolean>;
    enableBlTags: Schema<boolean, boolean>;
    enableForward: Schema<boolean, boolean>;
}>>;
export declare function apply(ctx: Context): void;
