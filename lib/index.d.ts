import { Context, Schema } from 'koishi';
export declare const name = "sexy-pic-lizard";
export declare const usage = "\n## \u968F\u673ASFW/NSFW\u56FE\u7247\uFF0C\u5185\u542B\u8D85\u591Atag:\n\n<details>\n\n### \u652F\u6301\u7684SFW-tags:\n- holo\u3001neko\u3001kemonomimi\u3001kanna\u3001gah\u3001coffee\u3001food\n### \u652F\u6301\u7684NSFW-tags:\n- hass\u3001hmidriff\u3001pgif\u30014k\u3001hentai\u3001hneko\u3001hkitsune\u3001hanal\u3001ass\u3001thigh\u3001hthigh\u3001paizuri\u3001boobs\u3001hboobs\n### \u4EE5\u4E0Btags\u8FC7\u4E8E\u91CD\u53E3\u6216\u8FC7\u4E8E\u771F\u5B9E\uFF0C\u8BF7\u914C\u60C5\u4F7F\u7528:\n- anal\u3001gonewild\u3001pussy\u3001tentacle\n### \u6211\u8D85\uFF0C\u6709\u7537\u540C:\n- yaoi\n</details>\n\n## \u4E3B\u8981\u529F\u80FD\u7684\u793A\u4F8B\u8C03\u7528\n<details>\n\n  - \u793A\u4F8B\u6307\u4EE4\uFF1Apic\n    - \u8FD4\u56DE\u968F\u673A\u9009\u53D6\u7684tag\u7684\u56FE\u7247\n\n  - \u793A\u4F8B\u6307\u4EE4\uFF1Apic -c 5 holo\n    - \u8FD4\u56DE holo (\u8D6B\u841D) tag \u7684 5 \u5F20\u56FE\u7247\n\n  - \u793A\u4F8B\u6307\u4EE4\uFF1Apic \u5929\u738B\u76D6\u5730\u864E\n    - \u65E0\u6548tag\uFF0C\u8FD4\u56DE\u5DF2\u5F00\u542F\u7684\u53EF\u7528\u7684tag\n\n  - \u793A\u4F8B\u6307\u4EE4\uFF1Atags\n    - \u8FD4\u56DE\u5DF2\u5F00\u542F\u7684\u53EF\u7528\u7684tag\n\n</details>\n\n";
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
export declare const imageTagApi = "/image?type=";
export declare function apply(ctx: Context): void;
