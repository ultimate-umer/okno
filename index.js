process.on("unhandledRejection", err => {
  console.error("Unhandled promise:", err);
});

process.on("uncaughtException", err => {
  console.error("Uncaught exception:", err);
});

console.log("🚀 index.js file loaded");
require('dotenv').config();
const statusHistory = {};
const { Client, GatewayIntentBits, EmbedBuilder } = require('discord.js');
const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 13_6) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.1 Safari/605.1.15",
  "Mozilla/5.0 (X11; Linux x86_64) Gecko/20100101 Firefox/122.0",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 17_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148"
];

function randomUA() {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

var bancache = {};
var unbancache = {};

async function mobileCheck(username) {
  try {
    const res = await fetch(
      `https://i.instagram.com/api/v1/users/web_profile_info/?username=${username}`,
      {
        headers: {
          "User-Agent": "Instagram 312.0.0.34.111 Android",
          "X-IG-App-ID": "936619743392459"
        }
      }
    );

    const json = await res.json();

    if (!json?.data?.user) return "REMOVED";
    return "ACTIVE";
  } catch {
    return "BLOCKED";
  }
}

async function check(username) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8 sec max

    try {
        const res = await fetch(`https://www.instagram.com/${username}/`, {
            signal: controller.signal,
            headers: {
                "User-Agent":
                    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0 Safari/537.36",
                "Accept": "text/html,application/xhtml+xml",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });

        const html = await res.text();
        clearTimeout(timeout);

        if (
            res.status === 404 ||
            html.includes("Sorry, this page isn't available") ||
            html.includes("/accounts/login/") ||
            html.length < 1500
        ) return "BANNED";

        if (html.includes("profilePage_")) return "ACTIVE";

        return "UNKNOWN";

    } catch (e) {
        clearTimeout(timeout);
        return "ERROR";
    }

  

    const res = await req.text();
    const sp = res.split('<meta property="og:description" content="');

    if (
        res.includes("challenge") ||
        res.includes("login") ||
        res.length < 800
    ) {
        return "BLOCKED";
    }

    if (sp.length > 1) {
        return sp[1].split('-')[0].trim();
    }

    return "UNKNOWN";
}


const TOKEN = process.env.DISCORD_TOKEN;
const ALLOWED_USER_IDS = process.env.ALLOWED_USER_IDS ? process.env.ALLOWED_USER_IDS.split(',') : [];
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes

let watchedAccounts = {}; 
let storedFollowerData = {};  

const allowedUserIds = [...ALLOWED_USER_IDS];
const banWatchList = [];
const unbanWatchList = [];

/* ================= FUN / FAKE INTEL ================= */

function rand(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function ghostCheck() {
    return rand(10, 70);
}

function hasNumbersOrUnderscore(username) {
    return /[_0-9]/.test(username);
}

function shortUsername(username) {
    return username.length <= 5;
}

function estimateBanChance(username) {
    let score = 40;

    if (hasNumbersOrUnderscore(username)) score += 10;
    if (shortUsername(username)) score += 15;

    score += rand(5, 20);
    return Math.min(score, 95);
}

function fakeAppealStatus() {
    const list = [
        "📤 Appeal Sent",
        "⏳ Under Review",
        "👀 Human Review",
        "🤖 Auto Reject Risk",
        "⚠️ No Response Yet"
    ];
    return list[rand(0, list.length - 1)];
}
// ================= ACCOUNT SCAN =================

function accountHealth(username) {
    let score = 60 + rand(0, 30);

    if (hasNumbersOrUnderscore(username)) score -= 10;
    if (shortUsername(username)) score -= 8;

    return Math.max(score, 30);
}

function riskLevel(score) {
    if (score >= 80) return "🟢 Low";
    if (score >= 60) return "🟡 Medium";
    return "🔴 High";
}

function fakeLastSeen() {
    return `${rand(3, 55)} minutes ago`;
}
function pushStatus(username, status) {
    if (!statusHistory[username]) statusHistory[username] = [];
    statusHistory[username].push(status);
    if (statusHistory[username].length > 3) {
        statusHistory[username].shift();
    }
}

function confirmed(username, value) {
    return (
        statusHistory[username] &&
        statusHistory[username].length === 3 &&
        statusHistory[username].every(s => s === value)
    );
}


function fakeFlags() {
    const flags = [
        "Username similarity",
        "Report spike",
        "Automation signals",
        "Sudden activity change",
        "Profile edit burst"
    ];

    return `• ${flags[rand(0, flags.length - 1)]}\n• ${flags[rand(0, flags.length - 1)]}`;
}
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages
    ],
});


client.once('ready', () => {
    console.log(`We have logged in as ${client.user.tag}`);
});

function formatTimestamp(date) {
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
}

async function monitorAccount(message, username, url, expectedStatus, startTime, watchType) {
    while (watchedAccounts[username]) {
        try {
            const info =
  Math.random() < 0.5
    ? await check(username)
    : await mobileCheck(username);

            console.log(`Monitoring ${username}`);
            const currentTime = Date.now()
            const timeDifference = Math.abs(currentTime - startTime) / 1000;
            const timeDifferenceMinutes = Math.floor(timeDifference / 60);

            if (expectedStatus === 'valid' && info.length == 3) {
                const embed = new EmbedBuilder()
                    .setTitle(`Account Has Been Smoked! | ${username} ✅`)
                    .setDescription(`**Time Taken:** ${timeDifferenceMinutes} minutes\n${info}`)
                    .setColor(0x000000)
                    .setFooter({ text: 'Monitor Bot v1', iconURL: client.user.displayAvatarURL() });

                await message.channel.send({ embeds: [embed] });
                delete watchedAccounts[username];
                const index = banWatchList.indexOf(username);
                if (index > -1) {
                    banWatchList.splice(index, 1);
                }
                break;
            } else if (watchType === 'unbanwatch' && expectedStatus === 'valid' && info.length > 3) {
                const embed = new EmbedBuilder()
                    .setTitle(`Account has been reactivated Successfully! | ${username} ✅`)
                   .setDescription(
    `⏱️ **Time Passed:** ${formatElapsed(startTime)}\n\n` +
    `📡 **Status Update:**\n${info}`
)

                    .setColor(0x000000)
                    .setFooter({ text: 'Monitor Bot v1', iconURL: client.user.displayAvatarURL() });

                await message.channel.send({ embeds: [embed] });
                delete watchedAccounts[username];
                const indexUnban = unbanWatchList.indexOf(username);
                if (indexUnban > -1) {
                    unbanWatchList.splice(indexUnban, 1);
                }
                break;
            }
        } catch (error) {
            console.error(`Error during monitoring for ${username}:`, error);
            sendErrorDM(message.author.id, error.message);
        }

        await new Promise(resolve => setTimeout(resolve, CHECK_INTERVAL));
    }
   

}
client.on('messageCreate', async (message) => {
    if (message.author.bot) return;

const args = message.content.trim().split(/\s+/);
const cmd = args[0].toLowerCase();

    if (message.author.bot) return;

    if (message.content.startsWith('!giveaccess')) {
        const args = message.content.split(' ');

        if (!allowedUserIds.includes(message.author.id)) {
            const embed = new EmbedBuilder()
                .setTitle('❌ Access Denied')
                .setDescription('You do not have permission to use this command.')
                .setColor(0xFF0000)
                .setFooter({ text: 'Permission required', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return;
        }

        if (args.length < 2 || !args[1]) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username}` })
                .setTitle('❌ Missing User ID')
                .setDescription('You need to specify a user ID to give access.\n\n**Usage:** `!giveaccess <user id>`')
                .setColor(0xFF0000)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: 'Please try again', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return;
        }

        const userIdToAdd = args[1];

        if (allowedUserIds.includes(userIdToAdd)) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username}` })
                .setTitle('👀 Already Has Access')
                .setDescription(`User with ID **${userIdToAdd}** already has access.`)
                .setColor(0xFFC107)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: 'Access already granted', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return;
        }

        allowedUserIds.push(userIdToAdd);

        const embed = new EmbedBuilder()
            .setAuthor({ name: `Requested by @${message.author.username}` })
            .setTitle('✅ Access Granted')
            .setDescription(`User with ID **${userIdToAdd}** has been granted access.`)
            .setColor(0x28A745)
            .setThumbnail(message.author.displayAvatarURL())
            .setFooter({ text: 'Access granted successfully', iconURL: client.user.displayAvatarURL() });

        await message.channel.send({ embeds: [embed] });
    } else if (message.content.startsWith('!unbanwatch')) {
        const args = message.content.split(' ');
        if (args.length < 2 || !args[1]) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username}` })
                .setTitle('❌ Missing Username')
                .setImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExZGw3Ymd4cXI0NDBjbm9mNGwycjlyOGMwY3ZnN3Brc2Q2NTlhOXh4ZSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/h0JgSyrWJl5YtMsJK7/giphy.gif')
                .setDescription('You need to specify a username to unbanwatch.\n\n**Usage:** `!unbanwatch <username>`')
                .setColor(0xFF0000)
                .setFooter({ text: 'Please try again', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return;
        }

        const username = args[1];
        const url = `https://www.instagram.com/${username}/?hl=en`;
        const startTime = new Date();

const info =
  Math.random() < 0.5
    ? await check(username)
    : await mobileCheck(username);


        if (info.length == 3) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username} ${formatTimestamp(startTime)}` })
                .setTitle('👀 Account Banned')
                .setDescription(`The Instagram account **@${username}** is currently banned. Monitoring for reactivation...`)
                .setColor(0x000000)
                .setImage('https://media0.giphy.com/media/v1.Y2lkPTc5MGI3NjExNm45OTM0aWdiMHlpZ3JrM3k3cDZndDN3aHpidnd4a2xvODZleXQ4aSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/pVWuLuV1JESZJdebkI/giphy.gif');

            await message.channel.send({ embeds: [embed] });
            unbancache[username] = info;
            watchedAccounts[username] = true;
            unbanWatchList.push(username);

            let hasSentEmbed = false;  

            const intv = setInterval(async function() {
                try {
                    const elapsed = formatElapsed(startTime);
                    const infoa =
  Math.random() < 0.5
    ? await check(username)
    : await mobileCheck(username);

                    const currentTime = Date.now();
                    const timeDifference = Math.abs(currentTime - startTime) / 1000;
                    const timeDifferenceMinutes = Math.floor(timeDifference / 60);

pushStatus(username, infoa);

if (
    infoa !== "BLOCKED" &&
    confirmed(username, infoa) &&
    infoa.length > 3 &&
    !hasSentEmbed
) {

            const embed = new EmbedBuilder()
                .setTitle(`Account has been reactivated Successfully! | ${username} ✅`)
                .setImage('https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExZm13NTM3dDJvbW85dDY5bnlhZGZjZ2h4NHdqeG54ZDRqdHpwdnlvdCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/NyInHmE9k7vDG/giphy.gif')
                .setDescription(
    `⏱️ **Time Passed:** ${formatElapsed(startTime)}\n\n` +
    `📡 **Status Update:**\n${info}`
)

                .setColor(0x000000)
                .setFooter({ text: 'Monitor Bot v1', iconURL: client.user.displayAvatarURL() });

                        await message.channel.send({ embeds: [embed] });
                        hasSentEmbed = true;  
                        clearInterval(intv);

                        const indexUnban = unbanWatchList.indexOf(username);
                        if (indexUnban > -1) {
                            unbanWatchList.splice(indexUnban, 1);
                        }
                    }
                } catch (error) {
                    console.error(`Error during monitoring for ${username}:`, error);
                    sendErrorDM(message.author.id, error.message);
                }
            }, CHECK_INTERVAL);
        } else {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username} ${formatTimestamp(startTime)}` })
                .setTitle('❌ Invalid for Unban Watch')
                .setDescription(`The Instagram account **@${username}** is not banned and cannot be watched for reactivation.`)
                .setColor(0xFF0000)
                .setImage('https://media4.giphy.com/media/v1.Y2lkPTc5MGI3NjExN3Brc29leGhzYjd2ZG9sc25nZnp2dzEycDh5dGhrbXVhMXphdmY0eiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/59d1zo8SUSaUU/giphy.gif')
                .setFooter({ text: 'Please try again', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        }
    } else if (message.content.startsWith('!banwatch')) {
        const args = message.content.split(' ');
        if (args.length < 2 || !args[1]) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username}` })
                .setTitle('❌ Missing Username')
                .setDescription('You need to specify a username to banwatch.\n\n**Usage:** `!banwatch <username>`')
                .setColor(0xFF0000)
                .setThumbnail(message.author.displayAvatarURL())
                .setFooter({ text: 'Please try again', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
            return;
        }

        const username = args[1];
        const url = `https://instagram.com/${username}`;
        const startTime = new Date();

        const info = await check(username)

        if (info.length != 3) {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username} ${formatTimestamp(startTime)}` })
                .setTitle('👀 Monitoring Initiated')
                .setDescription(`The Instagram account **@${username}** is currently valid. Monitoring for any bans...`)
                .setColor(0x000000)
                .setFooter({ text: 'Monitoring in progress', iconURL: client.user.displayAvatarURL() })
                .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3anhsd2o1aDdqaTY4Y3NyZnFxZjlrbWNwemtvbTV1bWU0ajY5MGJuZyZlcD12MV9naWZzX3NlYXJjaCZjdD1n/lmFm5QZMzdmQ8/giphy.gif');

            await message.channel.send({ embeds: [embed] });
            watchedAccounts[username] = true;
            banWatchList.push(username);
            const intv = setInterval(async function() {
                const infoa = await check(username)
pushStatus(username, infoa);

if (infoa !== "BLOCKED" && confirmed(username, infoa) && infoa.length == 3) {

                    const currentTime = Date.now()
                    const timeDifference = Math.abs(currentTime - startTime) / 1000;
                    const timeDifferenceMinutes = Math.floor(timeDifference / 60);
                    const embed = new EmbedBuilder()
                        .setTitle(`Account Has Been Removed! | ${username} ✅`)
                        .setImage(`https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMWx6aHRtZXlhamFtcHVoNDJ2azk5NWxxYjVvcDUwZng3MWUxdjZ3ZiZlcD12MV9naWZzX3NlYXJjaCZjdD1n/YSDq3DZMzQQrefGSST/giphy.gif`)
                       .setDescription(
    `⏱️ **Time Passed:** ${formatElapsed(startTime)}\n\n` +
    `📡 **Status Update:**\n${info}`
)

                        .setColor(0x000000)
                        .setFooter({ text: 'Monitor Bot v1', iconURL: client.user.displayAvatarURL() });
                    const index = banWatchList.indexOf(username);
                    if (index > -1) {
                        banWatchList.splice(index, 1);
                    }
                    await message.channel.send({ embeds: [embed] });
                    clearInterval(intv)
                }
            }, CHECK_INTERVAL)
        } else {
            const embed = new EmbedBuilder()
                .setAuthor({ name: `Requested by @${message.author.username} ${formatTimestamp(startTime)}` })
                .setTitle('❌ Invalid for Ban Watch')
                .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3azJlYTdxa2hic2RhdnRlaXp6b2F2YnJjcTZoZml0YW11MjJibXh1cSZlcD12MV9naWZzX3JlbGF0ZWQmY3Q9Zw/iNPNqI81MvDQ4D4n6D/giphy.gif')
                .setDescription(`The Instagram account **@${username}** is already banned and cannot be watched for bans.`)
                .setColor(0xFF0000)
                .setFooter({ text: 'Please try again', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        }
    } else if (message.content.startsWith('!banlist')) {
        if (banWatchList.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('📜 Ban Watch List')
                .setDescription('No accounts are currently being monitored for bans.')
                .setColor(0x000000)
                .setFooter({ text: 'Ban watch list is empty', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('📜 Ban Watch List')
                .setDescription(banWatchList.map(username => `• **@${username}**`).join('\n'))
                .setColor(0x000000)
                .setFooter({ text: 'Current ban watch list', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        }
    } else if (message.content.startsWith('!unbanlist')) {
        if (unbanWatchList.length === 0) {
            const embed = new EmbedBuilder()
                .setTitle('📜 Unban Watch List')
                .setDescription('No accounts are currently being monitored for unbans.')
                .setColor(0x000000)
                .setFooter({ text: 'Unban watch list is empty', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        } else {
            const embed = new EmbedBuilder()
                .setTitle('📜 Unban Watch List')
                .setDescription(unbanWatchList.map(username => `• **@${username}**`).join('\n'))
                .setColor(0x000000)
                .setFooter({ text: 'Current unban watch list', iconURL: client.user.displayAvatarURL() });

            await message.channel.send({ embeds: [embed] });
        }
    } else if (message.content.startsWith('!help')) {
        const embed = new EmbedBuilder()
            .setTitle('📖 Help - Available Commands')
             .setImage('https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZzJjbjZoaTdhNGI2cnlmeDl0eDF4cmRqOGMwYTkyOTI1dGxsdGptbCZlcD12MV9naWZzX3NlYXJjaCZjdD1n/DGsDLr9nyz2LkVgKFs/giphy.gif')
            .setDescription(`Instagram Monitoring & Intelligence System`)
            .addFields(
            { name: "🔍 !accountscan <username>", value: "Full account health, risk & flags scan" },
            { name: "👻 !ghostcheck <username>", value: "Inactive / ghost follower detection" },
            { name: "💎 !usernamevalue <username>", value: "Rare / premium username rating" },
            { name: "🚫 !banhistory <username>", value: "Fake previous ban records" },
            { name: "🧠 !instinct <username>", value: "IG AI behavior prediction mode" },
            { name: "🌑 !shadowrisk <username>", value: "Shadowban risk analysis (drama meter)" },

            { name: "⏳ !banwatch <username>", value: "Monitor account for ban" },
            { name: "♻️ !unbanwatch <username>", value: "Monitor account for unban" },
            { name: "📃 !banlist", value: "List all ban-watched accounts" },
            { name: "📃 !unbanlist", value: "List all unban-watched accounts" },

            { name: "🔑 !giveaccess <user id>", value: "Grant bot access to a user" },
            { name: " ⋆༺𓆩 𝐊𝐄𝐍𝐆 ☠︎︎ 𝐔𝐌𝟑𝐑 𓆪༻⋆ ", value: "‎" },
            { name: "❓ !help", value: "Show this help menu" }
        )
            .setColor(0x000000)
            .setFooter({ text: 'Requested by ' + message.author.username, iconURL: client.user.displayAvatarURL() });

        await message.channel.send({ embeds: [embed] });
    }else if (message.content.startsWith('!fake')) {
        const embed = new EmbedBuilder()
            .setColor('#000000')
            .setTitle('Account has been smoked! ✅ | example_username')
            .setDescription(`Time Taken: 0hr 2m 53s | Followers: 65`)
            .setFooter({ text: 'Monitor Bot v1' })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
    else if (cmd === "!accountscan") {

        const username = args[1];
        if (!username) return message.reply("Username missing.");

        const health = accountHealth(username);
        const risk = riskLevel(health);

        const embed = new EmbedBuilder()
            .setColor(0x5865f2)
            .setTitle("🧬 Instagram Intelligence Scan")
            .setImage("https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExaGM0bTlmZ2cxdXExenQycnBobHZxeDU0ZmE3aHlndnBwam1wOGk3eCZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/ADSJHOoIvyjKM/giphy.gif")
            .addFields(
                { name: "👤 Username", value: `@${username}`, inline: true },
                { name: "❤️ Account Health", value: `${health} / 100`, inline: true },
                { name: "🚨 Risk Level", value: risk, inline: true },
                { name: "🕒 Last Seen", value: `~${fakeLastSeen()}`, inline: true },
                { name: "🚩 Possible Flags", value: fakeFlags() }
            )
            .setFooter({ text: "Estimated – Not Official IG Data" })
            .setTimestamp();

        message.channel.send({ embeds: [embed] });
    }
    else if (cmd === "!ghostcheck") {
    const username = args[1];
    if (!username) return;

    const embed = new EmbedBuilder()
        .setColor(0x2f3136)
        .setTitle("👻 Ghost Follower Scan")
        .setImage('https://media1.giphy.com/media/v1.Y2lkPTc5MGI3NjExcmVqdW9hOWtzYXJmencxNzkzb2I1MTV6MzQzZ3ZuYTFqazNwcnkydiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/JZ3sDHgd48Dao/giphy.gif')

        .setDescription(
            `👤 @${username}\n\n` +
            `Inactive Followers: **${ghostCheck()}%**\n` +
            "⚠️ Engagement risk detected"
        )
        .setFooter({ text: "Estimated – Not Official IG Data" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}
else if (cmd === "!usernamevalue") {
    const username = args[1];
    if (!username) return;

    const embed = new EmbedBuilder()
        .setColor(0xf1c40f)
        .setTitle("💎 Username Value Scan")
        .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3ZWN5bHI0OHJubDRucmt3aDc5cHo0eWZndXBneGx0bmZucXU3bWNpdCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/QBd2kLB5qDmysEXre9/giphy.gif')
        .addFields(
            { name: "👤 Username", value: `@${username}`, inline: true },
            { name: "💰 Rarity Score", value: `${usernameValue(username)} / 100`, inline: true }
        )
        .setFooter({ text: "Market demand estimation" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}
else if (cmd === "!banhistory") {
    const username = args[1];
    if (!username) return;

    const embed = new EmbedBuilder()
        .setColor(0xed4245)
        .setTitle("📜 Ban History (Estimated)")
        .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3djNhYzQzYzg3bzhpemoxNGozMnBtMHNudmYxemlkeXEydnk4YjdnbCZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/pj6kX3c8bRijBrl6yR/giphy.gif')
        .setDescription(
            `👤 @${username}\n\n` +
            `🚫 History: **${fakeBanHistory()}**`
        )
        .setFooter({ text: "Internal signals – Unofficial" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}
else if (cmd === "!instinct") {
    const username = args[1];
    if (!username) return;

    const embed = new EmbedBuilder()
        .setColor(0x9b59b6)
        .setTitle("🤖 Instagram Instinct Mode")
        .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3a2RudGZzYnp3OGo3OXFsdHc5MXdxbnZyM2J3b2Z2aTB6ZTkzbWZybSZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/gKHGnB1ml0moQdjhEJ/giphy.gif')
        .setDescription(
            `👤 @${username}\n\n` +
            instinctMode()
        )
        .setFooter({ text: "AI behavior simulation" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}
else if (cmd === "!shadowrisk") {
    const username = args[1];
    if (!username) return;

    const embed = new EmbedBuilder()
        .setColor(0x000000)
        .setTitle("🌫️ Shadowban Risk Meter")
        .setImage('https://media.giphy.com/media/v1.Y2lkPWVjZjA1ZTQ3dTNkcHZ0MXp1NTI4ZXZ5YnN2ZzZpYWFubnZ1ZWRmY3lzbzk2bDJuZiZlcD12MV9naWZzX3RyZW5kaW5nJmN0PWc/bmIzCgWk6XDQuJ6ywn/giphy.gif')
        .setDescription(
            `👤 @${username}\n\n` +
            `Risk Level: **${shadowRisk()}**\n\n` +
            "📉 Reach suppression possible"
        )
        .setFooter({ text: "Visibility estimate only" })
        .setTimestamp();

    message.channel.send({ embeds: [embed] });
}

});

async function sendErrorDM(userId, errorMessage) {
    try {
        const user = await client.users.fetch(userId);
        const embed = new EmbedBuilder()
            .setAuthor({ name: `Requested by @${user.username} ${formatTimestamp(new Date())}` })
            .setTitle('❌ Error')
            .setDescription(`An error occurred: **${errorMessage}**`)
            .setColor(0xFF0000)
            .setFooter({ text: 'Please try again later', iconURL: client.user.displayAvatarURL() })
            .setImage('https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExeTg1cm1rZnB0MGdrajRib3RvdG5ucW52bHRqdjFidzJyNzZwYnBoNSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/hFVI29iuk2wFy/giphy.gif');

        await user.send({ embeds: [embed] });
    } catch (dmError) {
        console.error('Failed to send error DM:', dmError);
    }
}
function usernameValue(username) {
    let score = 50;
    if (username.length <= 5) score += 25;
    if (!hasNumbersOrUnderscore(username)) score += 15;
    score += rand(-5, 10);
    return Math.min(Math.max(score, 10), 100);
}

function fakeBanHistory() {
    const list = [
        "No prior bans detected",
        "1 temporary restriction (2023)",
        "Multiple reports – no action",
        "Past shadowban suspected",
        "Clean record"
    ];
    return list[rand(0, list.length - 1)];
}

function instinctMode() {
    const list = [
        "📈 Growth spike detected – stay low-key",
        "⚠️ Engagement anomaly – reduce actions",
        "🧊 Cool-down phase recommended",
        "🟢 Safe behavior pattern",
        "🤖 Automation signals very low"
    ];
    return list[rand(0, list.length - 1)];
}

function shadowRisk() {
    const list = [
        "🟢 Low",
        "🟡 Medium",
        "🔴 High",
        "🟠 Moderate",
        "⚠️ Unstable"
    ];
    return list[rand(0, list.length - 1)];
}
function formatElapsed(startTime) {
    const diff = Math.floor((Date.now() - startTime) / 1000);
    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    return `${minutes}m ${seconds}s`;
}



client.login(process.env.DISCORD_TOKEN);











