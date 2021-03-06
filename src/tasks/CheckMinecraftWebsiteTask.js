require('./../BedrockUpdateBot.js')
var request = require('request');
const Discord = require('discord.js');
var https = require('https');

class CheckMinecraftWebsiteTask {
    static getDelay() {
        return 30000;
    }

    static getName() {
        return "CheckMinecraftWebsiteTask";
    }

    static check(Bot) {
        var url = "https://www.minecraft.net/content/minecraft-net/_jcr_content.articles.grid?tileselection=auto&tagsPath=minecraft:article/news,minecraft:article/insider,minecraft:article/culture,minecraft:article/merch,minecraft:stockholm/news,minecraft:stockholm/guides,minecraft:stockholm/events,minecraft:stockholm/minecraft-builds,minecraft:stockholm/marketplace,minecraft:stockholm/deep-dives,minecraft:stockholm/merch,minecraft:stockholm/earth,minecraft:stockholm/dungeons,minecraft:stockholm/realms-plus,minecraft:stockholm/realms-java,minecraft:stockholm/minecraft,minecraft:stockholm/nether&propResPath=/content/minecraft-net/language-masters/en-us/jcr:content/root/generic-container/par/bleeding_page_sectio_1278766118/page-section-par/grid&count=500&pageSize=4&lang=/content/minecraft-net/language-masters/en-us"
        request({
            url: url,
            json: true
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var toCheck = botManager.config["textContainingTitles"];
                body["article_grid"].forEach(function (element) {
                    if (!(toCheck.includes(element["default_tile"]["title"]))) {
                        console.log(element["default_tile"]["title"]);
                        botManager.config["textContainingTitles"] += element["default_tile"]["title"] + ", ";

                        botManager.config["lastWebsiteArticle2"] = botManager.config["lastWebsiteArticle"];
                        botManager.config["lastWebsiteArticle"] = element["default_tile"]["title"];
                        botManager.saveConfig()

                        var embed = new Discord.RichEmbed()
                            .setTitle(botManager.config["lastWebsiteArticle"] + " :pushpin:")
                            .setDescription('**' + element["default_tile"]["sub_header"] + '**')
                            .setColor('#0941a9')
                            .setURL("https://minecraft.net" + element["article_url"])
                            .setImage("https://www.minecraft.net" + element["default_tile"]["image"]["imageURL"])
                            .setTimestamp(new Date((element["publish_date"]) * 1000))


                        botManager.getImage("https://www.minecraft.net" + element["default_tile"]["image"]["imageURL"], function (err, data) {
                            if (err) {
                                throw new Error(err);
                            } else {
                                botManager.client.post('media/upload', { media: data }, function (error, media, response) {

                                    if (!error) {
                                        var status = {
                                            status: '📌 A new article is out on the Minecraft website: ' + botManager.config["lastWebsiteArticle"] + " !\n📲 https://minecraft.net" + element["article_url"] + "",
                                            media_ids: media.media_id_string // Pass the media id string
                                        }

                                        botManager.client.post('statuses/update', status, function (error, tweet, response) {
                                            botManager.sendToChannels('news', embed)
                                        });

                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    }
}

module.exports = CheckMinecraftWebsiteTask;