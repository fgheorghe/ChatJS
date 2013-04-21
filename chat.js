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

/**
 * Chat Application Object.
 * @class Provides chat functionality.
 * @constructor
 */
var ChatJs = function() {
	// Client id array
	this._clients = [];

	// Client instance
	this.client = {};

	// Create the UI as soon as ExtJS is ready
	Ext.onReady( function() {
		// Prepare the client list
		this.clientList = Ext.create( 'Ext.grid.Panel', {
			region: 'west'
			,width: 180
			,columns: [
				{ header: 'Client Id',  dataIndex: 'id', flex: 1 }
			]
			,store: Ext.create( 'Ext.data.Store', {
				fields: [ 'id' ]
				,data: []
			} )
		} );

		// Handle a text sending UI action
		var handleSendText = function() {
			if ( this.textField.getValue() ) {
				this.addText( "<b>Me:</b> " + Ext.htmlEncode( this.textField.getValue() ) );

				// Emit event
				this.client.emit( 'clientMessage', { text: this.textField.getValue() } );
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

		// Prepare the text window
		this._firstTime = true; // Prevent the welcome text from displaying twice
		this.textPanel = Ext.create( 'Ext.panel.Panel', {
			region: 'center'
			,border: false
			,autoScroll: true
			,html: '<div style="height: 900px;">&nbsp;</div>'
			,bbar: [
				this.textField
				, '-'
				, Ext.create( 'Ext.button.Button', {
					text: 'Send'
					,handler: handleSendText.bind( this )
				} )
			]
			,listeners: {
				// Display welcome text
				afterlayout: function() {
					if ( this._firstTime === true ) {
						this.addText( '<b>Welcome to ChatJS.</b>' );
						this._firstTime = false;
					}
				}.bind( this )
			}
		} );

		// Prepare the window
		this.chatWindow = Ext.create( 'Ext.window.Window', {
			title: 'ChatJS'
			,closable: false
			,maximizable: false
			,minimizable: false
			,resizable: false
			,height: 500
			,width: 800
			,layout: 'border'
			,items: [
				this.clientList
				,this.textPanel
			]
		} );

		// Show
		this.chatWindow.show();
	}.bind( this ) );
};

/**
 * Method used for handling an incoming message.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.clientMessageHandler = function( data ) {
	// Add text to window
	this.addText( '<b>' + data.id + ':</b> ' + Ext.htmlEncode( data.text ) );
}

/**
 * Method used for handling a client list event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.clientListMessageHandler = function( data ) {
	// Store the list of clients, for later use
	this._clientList = data.ids;

	// Reload UI list
	this.clientList.getStore().loadRawData( data.ids );
}

/**
 * Method used for appending text.
 * @param {String} text String to add to window.
 * @function
 */
ChatJs.prototype.addText = function( text ) {
	// Get DOM component
	var obj = Ext.get( 'messageArea' );

	this.textPanel.body.insertHtml( "beforeEnd", text + '<br>' );
	this.textPanel.body.scroll( 'b', Infinity );
}

/**
 * Method used for handling a new client connection.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.newClientHandler = function( data ) {
	// Add text to window
	this.addText( '<b>Client connected:</b> ' + data.id );

	// Request a new list of clients
	this.client.emit( 'clientList', {} );
}

/**
 * Method used for handling a disconnecting client event.
 * @param {Object} data Data object.
 * @function
 */
ChatJs.prototype.disconnectingClientHandler = function( data ) {
	// Add text to window
	this.addText( '<b>Client left:</b> ' + data.id );

	// Request a new list of clients
	this.client.emit( 'clientList', {} );
}