import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat } from 'react-native-gifted-chat'
import AWS from 'aws-sdk/dist/aws-sdk-react-native'
// Initialize the Amazon Cognito credentials provider
AWS.config.region = 'us-west-2'; // Region
AWS.config.credentials = new AWS.CognitoIdentityCredentials({
    IdentityPoolId: 'us-west-2:370dcf64-2cae-4edf-8f41-07b8d3000ba4',
});

let lexRunTime = new AWS.LexRuntime();
let lexUserId = 'foodBot' + Date.now();

// front end
export default function App() {

	const [messages, setMessages] = useState([]);
	const [mid, setMid] = useState(1);
  
  //const url = 'https://l1z2i3b6nh.execute-api.us-east-2.amazonaws.com/default/findRestaurants';
  useEffect(() => {
    setMessages([
      {
        _id: new Date(),
        text: 'Hello, what would you want to eat today?',
        createdAt: new Date(),
        user: {
          _id: 2,
          name: 'LunchBot',
          avatar: 'https://placeimg.com/140/140/any',
        },
      }
    ]);
    setMid(prevMid => prevMid + 1);
    return ()=>{
      setMid(prevMid => 1);
      setMessages([]);
    }
  }, [])
  
  const onSend = useCallback((messages = []) => {
    setMessages(previousMessages => {
      return GiftedChat.append(previousMessages, messages);
    });

    // send to lex
    const message = messages[0].text;
    let params = {
        botAlias: 'Latest',
        botName: 'typeoffood',
        inputText: message,
        userId: lexUserId,
    }
    console.log("sendToLex")

    lexRunTime.postText(params, (err, lexResponse) => {
        if(err) {
            console.log(err);
        }
        if (lexResponse) {
            let lexMessage = lexResponse.message;

			const messages = [{
		        _id: new Date(),
		        text: lexResponse.message,
		        createdAt: new Date(),
		        user: {
		          _id: 2,
		          name: 'LunchBot',
		          avatar: 'https://placeimg.com/140/140/any',
		        },
		      }]
		    console.log(lexResponse);
			setMessages(previousMessages => {
				return GiftedChat.append(previousMessages, messages);
			})
			setMid(prevMid => prevMid + 1);
        }
    })
  }, [])

 
  return (
    <GiftedChat
      messages={messages}
      onSend={messages => onSend(messages)}
      user={{
        _id: 1,
      }}
    />
  )
}
// back end
