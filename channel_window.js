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
 * Channel window.
 * @class Provides channel functionality.
 * @constructor
 * @param {Object} config Channel window configuration object. Required key: channel (channel name string).
 */
var ChannelWindow = function( config ) {
	// Store configuation, in a 'private' property
	this._config = config;

	// Load 'everything'
	this.init();

	return this;
}

/**
 * Method used for initiating the channel window.
 * @param {String} channel Channel name.
 * @function
 */
ChannelWindow.prototype.init = function() {
	// Prepare the client list
	this.clientList = Ext.create( 'Ext.tree.Panel', {
		store: Ext.create( 'Ext.data.TreeStore', {
			data: {
				children: []
			}
		} )
		,width: 180
		,minWidth: 180
		,resizable: true
		,frame: false
		,border: true
		,lines: false
		,hideHeaders: true
		,collapsible: true
		,rootVisible: false
		,region: 'east'
		,title: 'Users'
	} );

	// Method used for loading channels users
	this.loadClientList = function( list ) {
		this.clientList.getRootNode().removeAll( false );
		this.clientList.getRootNode().appendChild( list );
	}

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
		region: 'center'
		,border: true
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
		title: this._config.channel
		,closable: true
		,maximizable: true
		,minimizable: false
		,resizable: true
		,constrainHeader: true
		,height: 500
		,width: 800
		,layout: 'border'
		,items: [
			this.clientList
			,this.textPanel
		]
	} );
}