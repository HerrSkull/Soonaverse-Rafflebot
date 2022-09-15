import { chunk } from "./util.js";

export class RaffleManager {
    
    constructor(guild, soon, client){
        this.guild = guild;
        this.soon = soon;
		this.client = client;
    }

    async raffle(channelId, messageId, collectionId, draws, interaction){
        await interaction.deferReply();
        let discordToEth = new Map();
        let participants = new Array();
        let winners = new Array();
        const channel = this.client.channels.cache.get(channelId);
        const message = await channel.messages.fetch(messageId);
        const reactions = message.reactions.cache;
		let users = new Array();
		reactions.forEach(async reaction => {
			let userbatch = await reaction.users.fetch();
			userbatch.forEach(user => {
				let discordtag = user.username + "#" + user.discriminator;
				if(!users.includes(discordtag)){
					users.push(discordtag); // distinct list of users who reacted
				}
			})
		})

        this.soon.getNftsByCollections([collectionId]).then(async (nfts) => {
            const nftHolderAddresses = nfts.reduce((acc, nft) => acc.includes(nft.owner) ? acc : [ ...acc, nft.owner], []); // get MM-Addresses of Holders and filter duplicates
            const chunkedAddresses = chunk(nftHolderAddresses, 10);
            await Promise.all(chunkedAddresses.map(async (addresses) => {
                const members = await this.soon.getMemberByIds(addresses);
                members.forEach( (member) => {
                    if(member.discord)
                    {
                        discordToEth.set(member.discord, member.uid); // add all holder-addresses to a discordtag -> eth-Addr map
                    }    
                });
            }));
            users.forEach( (discordtag) => { // filter out non holders
                if(discordToEth.has(discordtag)){
                    participants.push(discordtag);
                }
            })
            for(let i = 0; i < draws; i++){ // draw winners
                let rand = getRandomInt(0,participants.length);
                winners.push(participants[rand]);
                participants.splice(rand,1);
            }
            let msg = ":fire::partying_face:Congratulations to the winners of the raffle!:partying_face::fire:\r\n"
            for(let i = 0; i < winners.length; i++){
                msg += (1 + i) + ": " + winners[i] + "   " + discordToEth.get(winners[i]) + "\r\n"
            }

            await interaction.editReply(msg);
        })
    }
}

function getRandomInt(min, max) {   // The maximum is exclusive and the minimum is inclusive, evenly distributed according to: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random?retiredLocale=de
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
  }