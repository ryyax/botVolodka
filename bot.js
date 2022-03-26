const {Telegraf} = require('telegraf')
require('dotenv').config()
const http = require('http');
const { count } = require('console');
const bot = new Telegraf(process.env.BOT_TOKEN); 

// database(temporary)
db = {
   
}

// chats
const ryyax = 547015874;
const s_mia_h = 681035579;
const chatpasta = -1001517072456;

// technical functions
function sleep(ms){
    return new Promise(resolve=>setTimeout(resolve,ms));
}
function reply(ctx,text){
    ctx.reply(text,{reply_to_message_id:ctx.message.message_id})
}

functions
let onesixteen = function (){
    setInterval(()=>{
        let date = new Date();
        if(date.getUTCHours() === 23 && date.getUTCMinutes() === 16){
            bot.telegram.sendMessage(chatpasta,'1:16');
        }
    }, 60000)
}();
let morningAnnouncement = function(){
    setInterval(()=>{
        let date = new Date();
        if(date.getUTCHours() === 7 && date.getUTCMinutes() === 0){
            bot.telegram.sendMessage(chatpasta,morningMessage(date),{parse_mode:'HTML'}) 
            daily_weather_lviv(chatpasta)           
        }
    },60000)
}();
function getCoords(city_name, country_code){
    return new Promise((resolve)=>{
        http.get(`http://api.openweathermap.org/geo/1.0/direct?q=${city_name},${country_code}&limit=1&appid=${process.env.WEATHER_API_KEY}`, res=>{
            let data = '';
            res.on('data', chunk => data+=chunk);
            res.on('end',()=>{
                try{
                    data = JSON.parse(data);
                    resolve(data[0]);
                } catch(e){
                    bot.telegram.sendMessage(ryyax, `data coords error: ${e.message}`)
                }
            })
        }).on('error', e=>{
            bot.telegram.sendMessage(ryyax, `request coords error: ${e.message}`);
        });
    })
}
function getWeather(city_name, country_code){
    return new Promise((resolve)=>{
        getCoords(city_name, country_code).then(data => {
            let request = http.get(`http://api.openweathermap.org/data/2.5/onecall?lat=${data.lat}&lon=${data.lon}&appid=${process.env.WEATHER_API_KEY}&units=metric&lang=ua`,res=>{
                let data = '';
                res.on('data', chunk => data+=chunk);
                res.on('end',()=>{
                    try{
                        data = JSON.parse(data);
                        resolve(data);
                    }catch(e){
                        bot.telegram.sendMessage(ryyax,`data weather error: ${e.message}`)
                    }
                })
            }).on('error',e=>{
                bot.telegram.sendMessage(ryyax, `request weather error: ${e.message}`)
            });    
        })     
    })
}
function getTodayWeather(city_name, country_code){
    return new Promise(resolve=>{
        getWeather(city_name,country_code).then(data=>{
            resolve({
                temperature: Math.round(data.current.temp),
                feels_like: Math.round(data.current.feels_like),
                temperature_max: Math.round(data.daily[0].temp.max),
                temperature_min: Math.round(data.daily[0].temp.min),
                weather_conditions: data.current.weather[0].description,
            })
        })
    })
}

// messages
let morningMessage = date => {
return `<b>Доброго ранку, товариство!</b>
Сьогодні <b>${Math.floor((date.getTime()-new Date('February 24, 2022 03:40:00'))/1000/60/60/24)}-й</b> день, як <span class="tg-spoiler">хуйло</span> напало на нас
Але ми тримаємось і будем триматись, <u>бо ми українці!</u>
<b><i>Слава Україні!</i></b>`
}
let daily_weather_lviv = (chat) => {
    getTodayWeather('Lviv','UKR').then(weather=>{
bot.telegram.sendMessage(chat,`📍<b>У Львові</b> сьогодні чудова погода.
☀️<i>${weather.temperature}°</i> градусів, <i>${weather.weather_conditions}</i>, максимум сьогодні буде <i>${weather.temperature_max}°</i>, мінімум <i>${weather.temperature_min}°</i>. 
🙌<i>Всім прекрасного дня!</i>`,{parse_mode:'HTML'})
    })
}

// bot hears
bot.hears('1000',ctx=>{
    let chat_id = ctx.message.chat.id;
    if(chat_id.toString().slice(0,1)==='-'){
        chat_id = '_' + chat_id.toString().slice(1,chat_id.length);
    }
    let database_identifier = 'counting_for_dead_insides' + chat_id;
    async function fn(){    
        for(let i=993;i>0;i=i-7){
            ctx.reply(i);
            await sleep(3000);
        }
        ctx.reply('DEAD INSIDE!!!!!!!')
        db[database_identifier] = 0;
    }
    if(db[database_identifier] != 1){
        fn();
        db[database_identifier] = 1;
    } else{
        reply(ctx,'я можу рахувати тільки 1 раз одночасно(аби не було спаму, так то можу і більше)')    
    }
})
bot.hears('1000-7', ctx=>reply(ctx,'видно шо ти даун'));
bot.hears(/^соля$/gi, ctx=>ctx.replyWithHTML(`<a href="tg://user?id=${s_mia_h}">Наймиліше створіннячко на планеті</a>`))
bot.hears(/сам .* даун/gi, ctx=>{
    if(ctx.message.chat.type === 'private'){
        reply(ctx, 'була б це група я б лівнув');
    } else {
        ctx.leaveChat();
    }
});
bot.hears(/((добр).*(ранку|ранок)|(день|дня)|(вечір|вечора)|(ночі))$/gi, ctx=>reply(ctx,'ми з України!'));
bot.hears(/Слава Україні/gi, ctx=> reply(ctx,'Героям Слава!'))
bot.hears(/Слава Нації/gi, ctx=>reply(ctx,'Смерть ворогам!'))
bot.hears(/^Україна!?$/gi,ctx=>reply(ctx,'Понад усе!'))
bot.hears(/^путін$/gi,ctx=>reply(ctx,'хуйло!'))
bot.hears(/рускій ваєнний карабль/gi, ctx=>reply(ctx,'іді нахуй'))
bot.hears(/Ы/gi, ctx=>reply(ctx,'Кажи слово паляниця!'))

// bot on
// bot.on('sticker', ctx => reply(ctx, 'заєбеш'))
bot.on('voice', ctx => reply(ctx,'блять в тебе шо букви платні?'))

// bot commands
bot.command('/weather', ctx=>{
    daily_weather_lviv(ctx.message.chat.id)
})

// test
bot.hears('test',ctx=>{
    ctx.reply(ctx.message)
})


bot.launch();   

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))