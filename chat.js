/**
Copyright (c) 2013, Grosan Flaviu Gheorghe
All rights reserved.

Redistribution and use in source and binary forms, with or without
modification, are permitted provided that the following conditions are met:
    * Redistributions of source code must retain the above copyright
      notice, this list of conditions and the following disclaimer.
    * Redistributions in binary form must reproduce the above copyright
      notice, this list of conditions and the following disclaimer in the
      documentation and/or other materials provided with the distribution.
    * Neither the name of the author nor the
      names of its contributors may be used to endorse or promote products
      derived from this software without specific prior written permission.

THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
DISCLAIMED. IN NO EVENT SHALL GROSAN FLAVIU GHEORGHE BE LIABLE FOR ANY
DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
(INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
(INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
*/

// TODO: Format client names

/**
 * Chat Application Object.
 * @class Provides chat functionality.
 * @constructor
 */
var ChatJs = function() {
	// Client id array
	this._clients = [];

	// 'Array' of channel windows
	this._channelWindows = {};

	// Client instance
	this.client = {};

	// The current nickname
	this._nickname = null;

	// Create the UI as soon as ExtJS is ready
	Ext.onReady( function() {
		// Handle a text sending UI action
		var handleSendText = function() {
			// Check if the user tries sending a command (string starting with a /).
			if ( this.textField.getValue().toString().charAt( 0 ) === "/" ) {
				// Parse command
			 	this.parseCommand( this.textField.getValue().toString() );
			} else {
				if ( this.textField.getValue() ) {
					this.addText( "<b>" + this.myName + ":</b> " + Ext.htmlEncode( this.textField.getValue() ) );

					// Emit event
					this.client.emit( 'clientMessage', { text: this.textField.getValue() } );
				}
			}
			this.textField.setValue( "" );
		}

		// Text field
		this.textField = Ext.create( 'Ext.form.field.Text', {
			width: 560
			,enableKeyEvents: true
			,listeners: {
				keydown: function( field, e, eOpts ) {
					if ( e.getKey() === 13 ) {
						handleSendText.bind( this )();
					}
				}.bind( this )
			}
		} );

		// Send button
		this.sendButton = Ext.create( 'Ext.button.Button', {
			text: 'Send'
			,handler: handleSendText.bind( this )
		} );

		// Prepare the text window
		this.textPanel = Ext.create( 'Ext.panel.Panel', {
			border: true
			,frame: false
			,bodyStyle: {
				padding: '5px'
			}
			,autoScroll: true
			// Start adding text from the bottom
			,html: '<div style="height: 3000px;">&nbsp;</div>'
			,bbar: [
				this.textField
				, '-'
				,this.sendButton
			]
			,listeners: {
				resize: function() {
					// Scroll to bottom
					this.textPanel.body.scroll( 'b', Infinity );

					// Resize text field
					this.textField.setWidth(
						this.textPanel.getWidth() - this.sendButton.getWidth() - 11
					);
				}.bind( this )
			}
		} );

		// Prepare the window
		this.chatWindow = Ext.create( 'Ext.window.Window', {
			title: 'Status'
			,closable: false
			,maximizable: true
			,minimizable: false
			,resizable: true
			,constrainHeader: true
			,height: 500
			,width: 800
			,layout: 'fit'
			,items: [
				this.textPanel
			]
		} );

		// Show
		this.chatWindow.show();

		// Mask, until a connection is made
		this.chatWindow.mask();
	}.bind( this ) );
};

/**
 * Parse a command, prepare parameters, and send it.
 * @param {String} text String to parse.
 * @function
 */
ChatJs.prototype.parseCommand = function( text ) {
	// Trim command
	text = Ext.util.Format.trim( text );

	// Get the command name
	var commandPattern = /\/([A-Za-z]+)/i
		,parameters = text.split( " " ).slice( 1 )
		,command = commandPattern.exec( text )[1].toLowerCase()
		,data = {};

	switch ( command ) {
		case "whois":
			// Construct a whois command
			if ( parameters.length >= 1 ) {
				// Target
				data.target = parameters[0];
			}

			// Optional mask
			if ( parameters.length > 2 ) {
				data.mask = parameters.slice( 1 );
			} else if ( parameters.length === 2 ) {
				data.mask = parameters[1];
			}
			console.log( data );
			this.client.emit( command.toUpperCase(), data );
			break;
		case "join":
			// TODO: Properly handle whitespace!
			// Construct a join command
			if ( parameters.length >= 1 ) {
				// Channel list
				var channels = parameters[0].split( "," );
				data.channels = channels;
			}

			// Key(s)
			if ( parameters.length >= 2 ) {
				var keys = parameters[1].split( "," );
				data.keys = keys;
			}

			console.log( data );
			this.client.emit( command.toUpperCase(), data );
			break;
		default:
			// TODO:
	}
}

/**
 * Method used for handling a lost connection.
 * @function
 */
ChatJs.prototype.disconnectHandler = function() {
	// Just display an error window
	Ext.Msg.show( {
		title: 'Error'
		,msg: 'Connection lost. Please reload the page.'
		,closable: false
		,width: 255
	} );
}

/**
 * Method used for creating the name prompt.
 * @function
 */
ChatJs.prototype.createNamePrompt = function() {
	this.namePrompt = Ext.Msg.show( {
		title: 'Name'
		,msg: 'Please enter your name:'
		,width: 300
		,hideModel: 'hide'
		,buttons: Ext.Msg.OK
		,prompt: true
		,modal: false
		,closable: false
		,fn: function( button, text ) {
			// Set the name of this client
			this.client.emit( 'NICK', { nickname: text } );
			// Set the user details
			this.client.emit( 'USER', {
				user: 'user'
				,mode: 0
				,realname: 'realname'
			} );

			// Store name
			this._nickname = text;
		}.bind( this )
		,icon: Ext.window.MessageBox.INFO
	} );
}

/**
 * Method used for handling a successful connection.
 * @function
 */
ChatJs.prototype.connectHandler = function() {
	// Ignore if we already went through this process...
	if ( this._namePromptDisplayed ) {
		return;
	}
	this._namePromptDisplayed = true;

	// Request a name for this client
	// Hidden by an 'okName' event.
	this.createNamePrompt();
}

/**
 * Method used for appending text.
 * @param {String} text String to add to window.
 * @function
 */
ChatJs.prototype.addText = function( text ) {
	// Get DOM component
	var obj = Ext.get( 'messageArea' );

	// Apply extra formats
	text = Ext.util.Format.nl2br( text );

	this.textPanel.body.insertHtml( "beforeEnd", text + '<br>' );
	this.textPanel.body.scroll( 'b', Infinity );
}

/** IRC Client Protocol Handlers */

/**
 * Handler for an 'ERR_NICKNAMEINUSE' event.
 * @function
 */
ChatJs.prototype.ERR_NICKNAMEINUSE = function( data ) {
	// Show an error message, then the prompt asking for a new name
	Ext.Msg.show( {
		title: 'Nickname'
		,msg: 'Nickame is already in use. Please input a different nickame.'
		,buttons: Ext.Msg.OK
		,width: 380
		,modal: false
		,closable: false
		,fn: function() {
			// Display the prompt again
			this.createNamePrompt();
		}.bind( this )
	} );
}

/**
 * Method used for handling 'JOIN' event, and create a new channel window or update the channel member list.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.JOIN = function( data ) {
	// Create a new window, if the JOIN command is reffering to the current user AND a window for this channel doesn't exist
	// TODO: Check if channel window exists!
	if ( data.nickname.toLowerCase() === this._nickname.toLowerCase() && typeof this._channelWindows[data.channel] === "undefined" ) {
		// Create window
		this._channelWindows[data.channel] = new ChannelWindow( {
			channel: data.channel
		} );

		// Show window
		this._channelWindows[data.channel].chatWindow.show();
	} else if ( data.nickname.toLowerCase() === this._nickname.toLowerCase() && this._channelWindows[data.channel] ) {
		// Just focus
		this._channelWindows[data.channel].chatWindow.focus();
	}
}

/**
 * Method used for handling 'ERR_NONICKNAMEGIVEN' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.ERR_NONICKNAMEGIVEN = function( data ) {
	// Add text to window
	this.addText( '* '  + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'RPL_TOPIC' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_TOPIC = function( data ) {
	console.log( data );
}

/**
 * Method used for handling 'RPL_NAMREPLY' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_NAMREPLY = function( data ) {
	console.log( data.names );
	// Load list of clients, if a window exists
	if ( typeof this._channelWindows[data.channel] !== "undefined" ) {
		var names = [];
		// Convert to tree items
		for ( var i = 0; i < data.names.length; i++ ) {
			names.push( {
				text: data.names[i]
				,leaf: true
			} );
		}
		this._channelWindows[data.channel].loadClientList( names );
	}
}

/**
 * Method used for handling 'RPL_NOTOPIC' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_NOTOPIC = function( data ) {
	console.log( data );
}

/**
 * Method used for handling 'ERR_NONICKNAMEGIVEN' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.ERR_NEEDMOREPARAMS = function( data ) {
	// Add text to window
	this.addText( '* '  + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'ERR_NOSUCHCHANNEL' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.ERR_NOSUCHCHANNEL = function( data ) {
	// Add text to window
	this.addText( '* '  + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'ERR_NOSUCHNICK' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.ERR_NOSUCHNICK = function( data ) {
	// Add text to window
	this.addText( '* '  + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'RPL_ENDOFWHOIS' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_ENDOFWHOIS = function( data ) {
	// Add text to window
	this.addText( '* [' + Ext.htmlEncode( data.nick ) + '] End of WHOIS list' );
}

/**
 * Method used for handling 'RPL_WHOISUSER' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_WHOISUSER = function( data ) {
	// Add text to window
	this.addText( '* [' + Ext.htmlEncode( data.nick ) + '] (' + Ext.htmlEncode( data.user ) + '@' + Ext.htmlEncode( data.host ) + '): '  + Ext.htmlEncode( data.realname ) );
}

/**
 * Method used for handling 'RPL_WHOISSERVER' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_WHOISSERVER = function( data ) {
	// Add text to window
	this.addText( '* [' + Ext.htmlEncode( data.nick ) + '] ' + Ext.htmlEncode( data.server ) + ' :' + Ext.htmlEncode( data.serverinfo ) );
}

/**
 * Method used for handling 'RPL_MYINFO' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_MYINFO = function( data ) {
	// Add text to window
	this.addText( '*** ' + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'RPL_CREATED' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_CREATED = function( data ) {
	// Add text to window
	this.addText( '*** ' + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'RPL_YOURHOST' event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_YOURHOST = function( data ) {
	// Add text to window
	this.addText( '*** ' + Ext.htmlEncode( data.msg ) );
}

/**
 * Method used for handling 'RPL_WELCOME' reply, this marks a successful registration event!
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.RPL_WELCOME = function( data ) {
	// Unmask the window
	this.chatWindow.unmask();

	// Focus the input field
	this.textField.focus( false, 200 );

	// Display welcome text
	this.addText( '<b>Welcome to ChatJS.</b>' );

	// Add text to window
	this.addText( '*** ' + Ext.htmlEncode( data.msg ) );
}