﻿var privateMessenger = {
	currentPage : 1,
	replyInfo : {},
	deleteIds : [],
	selectedMessages : [],
	myMessages : {},
	messageKeys : [],
	canSend : true,
	myID : 0,
	myPMKey : '',
	sendingTo : '',
	openMessenger : function () {
		document.getElementById('privateMessenger').style.display = 'block';
		if (this.currentPage != 1)
			document.getElementById('pmPage_' + this.currentPage).style.display = 'none';
		this.currentPage = 1;
		document.getElementById('pmPage_1').style.display = 'block';
	},
	loadMessages : function () {
		document.getElementById('pmError').innerHTML = '<div class="alert alert-info fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Please Wait:</strong> Loading your messages...</div>';
		if (this.myID == 0 || this.myPMKey == '')
			return false;
		MNX.startNewRequest({
			id : this.myID,
			authKey : this.myPMKey
		}, 'MNX_CMD_GET_MESSAGES', privateMessenger.handleGetMessages);
	},
	handleGetMessages : function (success, responseData) {
		if (!success) {
			alert('There was an error loading your user message results.');
			return false;
		}
		if (responseData['success'] == true) {
			document.getElementById('pmError').innerHTML = '';
			document.getElementById('msgBody').innerHTML = '';
			if (Number(responseData['totalPMs']) > 0) {
				for (var i in responseData['results']) {
					document.getElementById('msgBody').innerHTML = "<tr onclick='privateMessenger.viewPM(\"" + i + "\");'><td><input type='checkBox' value='1' id='msgc" + i + "' onclick='privateMessenger.selectMessage(\"" + i + "\");'/><td >" + responseData['results'][i]['fromName'] + "</td><td>" + responseData['results'][i]['date'] + "</td><td>" + responseData['results'][i]['message'].substr(0, 22) + "...</td></tr>" + document.getElementById('msgBody').innerHTML;
					privateMessenger.myMessages[i] = {
						from : responseData['results'][i]['fromName'],
						date : responseData['results'][i]['date'],
						message : responseData['results'][i]['message'],
						fromID : responseData['results'][i]['fromID']
					};
				}
				return true;
			} else {
				document.getElementById('msgBody').innerHTML = '<tr><td colspan="4"><center>No Messages!</center></td></tr>';
				return true;
			}
		}
		alert('There was an error loading your user message results.');
		return false;
	},
	selectMessage : function (mID) {
		var box = document.getElementById('msgc' + mID);
		if (box == undefined)
			return false;
		if (box.checked == false) {
			this.selectedMessages.splice(this.selectedMessages.indexOf(Number(mID)), 1);
			if (this.selectedMessages.length == 0) {
				document.getElementById('noneSelectedButtons').style.display = 'block';
				document.getElementById('msgSelectedButtons').style.display = 'none';
			} else {
				document.getElementById('deleteMsgBtnLbl').innerHTML = 'Delete [' + this.selectedMessages.length + ']';
			}
			return true;
		} else {
			if (this.selectedMessages.indexOf(Number(mID)) != -1) {
				return false;
			}
			this.selectedMessages.push(Number(mID));
			document.getElementById('deleteMsgBtnLbl').innerHTML = 'Delete [' + this.selectedMessages.length + ']';
			if (this.selectedMessages.length == 1) {
				document.getElementById('noneSelectedButtons').style.display = 'none';
				document.getElementById('msgSelectedButtons').style.display = 'block';
			}
			return true;
		}
	},
	viewPM : function (mID) {
		if (this.myMessages[mID] == undefined) {
			return false;
		}
		document.getElementById('pmError').innerHTML = '';
		document.getElementById('pmPage_' + this.currentPage).style.display = 'none';
		this.currentPage = 2;
		document.getElementById('pmPage_' + this.currentPage).style.display = 'block';
		document.getElementById('pmViewFrom').innerHTML = this.myMessages[mID].from;
		document.getElementById('pmViewDate').innerHTML = this.myMessages[mID].date;
		document.getElementById('pmViewMsg').value = this.myMessages[mID].message;
		this.replyInfo = {
			name : this.myMessages[mID].from,
			id : this.myMessages[mID].fromID,
			pmID : mID
		};
	},
	replyToMsg : function () {
		if (this.myMessages[this.replyInfo.pmID] == undefined)
			return false;
		document.getElementById('pmError').innerHTML = '';
		document.getElementById('pmPage_' + this.currentPage).style.display = 'none';
		document.getElementById('pmReplyTo').value = this.replyInfo.name;
		document.getElementById('pmReplyMsg').value = '';
		this.currentPage = 3;
		document.getElementById('pmPage_' + this.currentPage).style.display = 'block';
	},
	composeMsg : function () {
		document.getElementById('pmPage_' + this.currentPage).style.display = 'none';
		this.currentPage = 4;
		document.getElementById('pmError').innerHTML = '';
		document.getElementById('pmComposeTo').value = '';
		document.getElementById('pmComposeMsg').value = '';
		document.getElementById('pmPage_' + this.currentPage).style.display = 'block';
	},
	goToInbox : function () {
		document.getElementById('pmError').innerHTML = '';
		document.getElementById('pmPage_' + this.currentPage).style.display = 'none';
		this.currentPage = 1;
		document.getElementById('pmPage_' + this.currentPage).style.display = 'block';
	},
	deleteMessages : function (pmIDs) {
		document.getElementById('pmError').innerHTML = '<div class="alert alert-info fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Deleteing...</strong> Deleting selected messages...</div>';
		if (pmIDs.length < 1)
			return false;
		this.deleteIds = pmIDs
			MNX.startNewRequest({
				id : this.myID,
				authKey : this.myPMKey,
				pMsgIds : pmIDs.join(',')
			}, 'MNX_CMD_REMOVE_MESSAGE', privateMessenger.handleRemoveMessage);
	},
	handleRemoveMessage : function (success, responseData) {
		if (!success) {
			alert('There was an error deleting your message(s)');
			return false;
		}
		if (responseData['success'] == true) {
			document.getElementById('pmError').innerHTML = '<div class="alert alert-success fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Success!</strong> Your messages have been deleted!</div>';
			for (var i in privateMessenger.deleteIds) {
				if (privateMessenger.myMessages[privateMessenger.deleteIds[i]] != undefined)
					delete privateMessenger.myMessages[privateMessenger.deleteIds[i]]
			}
			privateMessenger.deleteIds = []
			document.getElementById('msgBody').innerHTML = '';
			var addedNum = 0;
			for (var i in privateMessenger.myMessages) {
				if (privateMessenger.myMessages[i].from == undefined)
					continue;
				addedNum++;
				document.getElementById('msgBody').innerHTML = "<tr><td><input type='checkBox' value='1' id='msgc" + i + "' onclick='privateMessenger.selectMessage(\"" + i + "\");'/></td><td onclick='privateMessenger.viewPM(\"" + i + "\");'>" + privateMessenger.myMessages[i].from + "</td><td onclick='privateMessenger.viewPM(\"" + i + "\");'>" + privateMessenger.myMessages[i].date + "</td><td onclick='privateMessenger.viewPM(\"" + i + "\");'>" + privateMessenger.myMessages[i]['message'].substr(0, 22) + "...</td></tr>" + document.getElementById('msgBody').innerHTML;
			}
			if (addedNum == 0) {
				document.getElementById('msgBody').innerHTML = '<tr><td colspan="4"><center>No Messages!</center></td></tr>';
				return false;
			}
			return true;
		}
		alert('There was an error deleting your message(s)');
		return false;
	},
	sendNewMsg : function (isReply) {
		document.getElementById('pmError').innerHTML = '<div class="alert alert-info fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Sending...</strong> Sending new message...</div>';
		if (!isReply) {
			var username = document.getElementById('pmComposeTo').value;
			var msg = document.getElementById('pmComposeMsg').value;
		} else {
			var username = this.replyInfo.name;
			var msg = document.getElementById('pmReplyMsg').value;
		}
		if (username.length > 25 || username.length < 4)
			return document.getElementById('pmError').innerHTML = '<div class="alert alert-error fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Error!</strong> Please enter a valid username.</div>';
		if (msg.length > 250 || msg.length < 4)
			return document.getElementById('pmError').innerHTML = '<div class="alert alert-error fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Error!</strong> Please enter a message longer than 4 characters and no more than 250.</div>';
		this.canSend = false;
		this.sendingTo = username;
		MNX.startNewRequest({
			id : this.myID,
			authKey : this.myPMKey,
			toName : username,
			message : msg
		}, 'MNX_CMD_SEND_MESSAGE', privateMessenger.handleSendMessage);
	},
	handleSendMessage : function (success, responseData) {
		privateMessenger.canSend = true;
		if (success == false) {
			alert('There was an error sending your message. The API server might be down.');
			return false;
		}
		if (responseData['success'] == false) {
			switch (responseData['errorNum']) {
			case 1069:
			case 2279:
				return document.getElementById('pmError').innerHTML = '<div class="alert alert-error fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Error!</strong> This user does not exist. Try again.</div>';
			case 2405:
				return document.getElementById('pmError').innerHTML = '<div class="alert alert-error fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Error!</strong> Your message must be between 4 and 250 characters.</div>';
			default:
				return document.getElementById('pmError').innerHTML = '<div class="alert alert-error fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Error!</strong> There was an error sending your PM.</div>';
			}
		} else {
			privateMessenger.goToInbox();
			document.getElementById('pmError').innerHTML = '<div class="alert alert-success fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Success!</strong> Your message has been sent!</div>';
			thisMovie('miraiLoader').sendNewPM(privateMessenger.sendingTo);
			privateMessenger.sendingTo = '';
			return true;
		}
		return document.getElementById('pmError').innerHTML = '<div class="alert alert-error fade in"><button data-dismiss="alert" class="close" type="button">×</button><strong>Error!</strong> Your message must be between 4 and 250 characters.</div>';
	},
	deleteMsg : function () {
		if (this.replyInfo.pmID == undefined || isNaN(this.replyInfo.pmID))
			return false;
		this.goToInbox();
		return this.deleteMessages([this.replyInfo.pmID]);
	},
	deleteSelectedMessages : function () {
		if (this.selectedMessages.length < 1)
			return false
			this.deleteMessages(this.selectedMessages);
		this.selectedMessages = []
		document.getElementById('noneSelectedButtons').style.display = 'block';
		document.getElementById('msgSelectedButtons').style.display = 'none';
		return true;
	}
};
function newPrivateMessageByID(pID, pName) {
	document.getElementById('pmPage_' + privateMessenger.currentPage).style.display = 'none';
	privateMessenger.currentPage = 4;
	document.getElementById('pmError').innerHTML = '';
	document.getElementById('pmComposeTo').value = pName;
	document.getElementById('pmComposeMsg').value = '';
	document.getElementById('pmPage_' + privateMessenger.currentPage).style.display = 'block';
}
function newMsg() {
	privateMessenger.loadMessages();
}
MNX.addMNXCommand('MNX_CMD_GET_MESSAGES', 'get_messages');
MNX.addMNXCommand('MNX_CMD_SEND_MESSAGE', 'create_message');
MNX.addMNXCommand('MNX_CMD_REMOVE_MESSAGE', 'remove_message');
