const express = require('express');
const { OpenAI } = require('openai');
const dotenv = require('dotenv');
const { fetchVideoRecommendation } = require('./recommend-video');

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Setup OpenAI API

const openai = new OpenAI();

app.use(express.json());
app.use(express.static('public')); // Ensure your static files are served correctly

app.post('/chat', async (req, res) => {
    const { message } = req.body;
    const tools = [
        {
          "type": "function",
          "function": {
            "name": "add_video",
            "description": "Add a video most relevant to the conversation. Use when the user starts a new topic, question.",
            "parameters": {
              "type": "object",
              "properties": {
                "topic": {
                  "type": "string",
                  "description": "The topic of the question. Example: Solving an equation with complex numbers",
                },
                
              },
              "required": ["topic"],
            },
          }
        }
    ];
    try {
        // OpenAI chat completion request
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {role: "system", content: "You are a helpful assistant."},
                {
                    role: "user",
                    content: message,
                },
            ],
            tools: tools,
        });

        
       
        let finishReason = response.choices[0].finish_reason;
        if (finishReason === 'tool_calls') {
            const args = response.choices[0].message.tool_calls[0].function.arguments;
            const parsedArgs = typeof args === 'string' ? JSON.parse(args) : args;
            const topic = parsedArgs.topic;
            console.log(topic);
            if (response.choices[0].message.tool_calls[0].function.name == "add_video"){
                let url = await fetchVideoRecommendation(topic);
                const response = await openai.chat.completions.create({
                    model: "gpt-3.5-turbo",
                    messages: [
                        {role: "system", content: "You are a helpful assistant."},
                        {
                            role: "user",
                            content: message,
                        },
                    ],
                });
                let replies = response.choices[0].message.content.trim();
                res.json([
                    {role: 'assistant', content: replies}, // Assistant's response
                    {role: 'video', content: url} // Video recommendation
                ]);
                
            }
        }else{
            let replies = response.choices[0].message.content.trim();
            res.json([{role: 'assistant', content: replies}]);
        }
        
        
    } catch (error) {
        console.error('Error:', error);
        res.status(500).send('Internal Server Error');
    }
});


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
