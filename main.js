import { GUILD_ID } from "./config.js";
import { Client, Intents} from "discord.js";
import { Soon } from "soonaverse";
import { RaffleManager } from "./modules/RaffleManager.js";

let intents = new Intents(Intents.NON_PRIVILEGED);

intents.add('GUILDS');
intents.add('GUILD_MEMBERS');

const client = new Client({intents : intents});
const soon = new Soon();

var raffleManager = new RaffleManager(GUILD_ID,soon, client);

async function registerSlashCommands(){
    client.api.applications(client.user.id).commands.post({data: {
        name: 'raffle',
        description: 'raffle over everyone who reacted',
        type: '1',
        default_member_permissions: 0,
        options : [
            {
                name : 'channelid',
                description : 'The channelID the message is in',
                type : 3,
                require : true
            },
            {
                name : 'messageid',
                description : 'The messageID to raffle',
                type : 3,
                require : true
            }
            ,
            {
                name : 'collectionid',
                description : 'The collectionID the participants needs to be holders of',
                type : 3,
                require : true
            }
            ,
            {
                name : 'draws',
                description : 'How many winners are picked',
                type : 4,
                require : true
            }
        ]
    }});
}

client.once("ready", () => {
    registerSlashCommands();
});

client.on('interactionCreate', async interaction => {
    if(!interaction.isCommand()) return
    
    if(interaction.commandName === 'raffle'){
        const channelId = interaction.options.getString("channelid", true);
        const messageId = interaction.options.getString("messageid", true);
        const collectionId = interaction.options.getString("collectionid", true);
        const draws = interaction.options.getInteger("draws", true);
        await raffleManager.raffle(channelId, messageId, collectionId, draws, interaction);
        return
    }
})

client.on("rateLimit", (limit) => {
    timeout = limit.timeout;
    console.log("[TIMEOUT]: " + timeout);
});
client.on("warn", (warning) => console.log(warning));
client.on("error", console.error);

process.on('unhandledRejection', error => {
    console.log('Error:', error);
});

client.login(process.env.API_TOKEN);
