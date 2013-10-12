ChatJS
======

IRC 2.0 (Json based Web IRC) implementation, using Node.js, Socket.io, Extjs, Phantomjs and jQuery.

Based on RFC2812: http://tools.ietf.org/html/rfc2812.

Supported Client to Server commands:

- NICK
- USER
- WHOIS
- JOIN
- PART
- PRIVMSG
- MOTD
- LUSERS
- PONG
- TOPIC
- LIST
- OPER
- NAMES
- QUIT
- AWAY
- MODE
- KILL
- INFO
- ADMIN
- TIME
- VERSION
- WHO
- USERS (Not implemented, returns ERR_USERSDISABLED as per RFC2812)
- WALLOPS (As per RFC2812, this command can be abused. Limited access to IRC Operators)
- ISON
- USERHOST
- INVITE
- KICK

Supported Server to Client commands:

- RPL_WELCOME
- RPL_YOURHOST
- RPL_CREATED
- RPL_MYINFO
- ERR_NOSUCHNICK
- ERR_NONICKNAMEGIVEN
- RPL_WHOISUSER
- RPL_WHOISSERVER
- RPL_ENDOFWHOIS
- ERR_NICKNAMEINUSE
- ERR_NEEDMOREPARAMS
- ERR_NOSUCHCHANNEL
- RPL_TOPIC
- RPL_NOTOPIC
- RPL_NAMREPLY
- JOIN
- PART
- ERR_NOTEXTTOSEND
- ERR_NORECIPIENT
- PRIVMSG
- RPL_WHOISCHANNELS
- QUIT
- RPL_MOTDSTART
- RPL_MOTD
- RPL_ENDOFMOTD
- ERR_NOMOTD
- RPL_LUSERCLIENT
- RPL_LUSEROP
- RPL_LUSERUNKOWN
- RPL_LUSERCHANNELS
- RPL_LUSERME
- RPL_WHOISIDLE
- RPL_WHOISOPERATOR
- PING
- RPL_LISTEND
- RPL_LIST
- RPL_YOUREOPER
- ERR_PASSWDMISMATCH
- NICK
- ERR_ERRONEUSNICKNAME
- RPL_ENDOFNAMES
- RPL_UNAWAY
- RPL_NOWAWAY
- RPL_AWAY
- ERR_UMODEUNKNOWNFLAG
- ERR_USERSDONTMATCH
- RPL_UMODEIS
- ERR_NOPRIVILEGES
- RPL_INFO
- RPL_ENDOFINFO
- RPL_ADMINME
- RPL_ADMINLOC1
- RPL_ADMINLOC2
- RPL_ADMINEMAIL
- RPL_TIME
- RPL_VERSION
- RPL_WHOREPLY
- RPL_ENDOFWHO
- ERR_USERSDISABLED
- WALLOPS
- RPL_ISON
- RPL_USERHOST
- INVITE
- RPL_INVITING
- RPL_INVITELIST
- RPL_ENDOFINVITELIST
- ERR_CHANNELISFULL
- ERR_BADCHANNELKEY
- KICK