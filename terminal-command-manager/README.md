# Instructions
1. cd to terminal-command-manager
2. run 'npm run dev'
3. split terminal
4. cd to TerminalDBServer
5. run 'node server'
6. Server should say it is listening at port 5050. Client should give a link to localhost to run the frontend.
7. Ctrl+Click the link

# How to use the app
1. Changes made to the text areas are saved when the user's focus leaves the text area.
2. Pressing delete will... you know... delete the row
3. 'Add new' button will create a default terminal command that you can change and save
4. Saves are instantaneous to the 'commands-data.json' file in the server.
5. Feel free to copy the json data to override the json file in the MindPlex app.

PRO TIP: Copy the old json to override the server's json first before editing. Then, when the frontend is loaded, all the previous data will be there!