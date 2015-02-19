function bindPastes() 
{
	$('.codePaste').each(function() {
	    CodeMirror.fromTextArea(this, {
	        mode: 'javascript',
	        theme: "monokai",
	        height: "300px",
	        lineNumbers: true,
	        readOnly: true
	    });
	});

	CodeMirror.fromTextArea(document.getElementById("defaultPaste"), {
	    mode: 'javascript',
	    theme: "monokai",
	    viewportMargin: Infinity,
	    lineNumbers: true,
	    readOnly: true
	});
}

function bindCopies() 
{
	var client = new ZeroClipboard( document.getElementsByClassName("p-copy") );
	client.on( "ready", function( readyEvent ) {
	  client.on( "aftercopy", function( event ) {
	  	swal({title: "Copied", type: "success", timer: 1000});
	  } );
	});
}

function bindDeletes() 
{
	$('.delete').on('click', function() 
	{
		var documentId = $(this).data('del-documentid');
		var cred = $.cookie('v') + ":" + $.cookie('u');
		vex.dialog.confirm({
	  		message: 'Delete this Pasting?',
	  		callback: function(value) 
	  		{
	    		if (value) 
	    		{
	    			NProgress.start();
				  	var Delete = new DeletePasteModel();
					var deleteData = {
						v: cred, 
						documentId: documentId
					};
					
					Delete.save(deleteData, {
						success: function (response) 
						{
							NProgress.done();
							if (response.attributes.st == 'ok') {
								location.href = "/" + $.cookie('u');
							} else {
								swal("Error", response.attributes.msg, "error");
							}
						}
			    	});
	    		}
	  		}
		});
	});
}

function bindPastingInput() 
{
	var codeEditor = CodeMirror.fromTextArea(document.getElementById('pastingStr'), {
	    lineNumbers: true,
	    viewportMargin: Infinity,
	    mode: "javascript",
	    autoCloseBrackets: true,
	    matchBrackets: true,
	    showTrailingSpace: true,
	    theme: "monokai",
	  	extraKeys: {
	        "F11": function(cm) {
	          cm.setOption("fullScreen", !cm.getOption("fullScreen"));
	        },
	        "Esc": function(cm) {
	          if (cm.getOption("fullScreen")) cm.setOption("fullScreen", false);
	        }
	  	}
	});
	
	codeEditor.setValue("");
	return codeEditor;
}

function bindShareButton()
{
	$('#shareBtn').on('click', function() {

		if ($('#email').val() != '' && $('#pwd').val() != '') 
		{
			var Register = new RegisterModel();
			var pasteData = {
			    username: $('#email').val().toLowerCase(),
			    pwd: $('#pwd').val(),
			    text: "My first Pasting",
			    protected: 0
			};

			if ($('#pwd').val() == $('#pwd2').val()) {
				NProgress.start();
				Register.save(pasteData, {
					success: function (response) {

						mixpanel.people.set({
						    $username: response.attributes.u.toLowerCase()
						});

						NProgress.done();
						if (response.attributes.st == 'ok') {
							$.cookie('v', response.attributes.v, {expires: 7, path: '/' });
							$.cookie('uid', response.attributes.userId, {expires: 7, path: '/' });
							$.cookie('u', response.attributes.u.toLowerCase(), {expires: 7, path: '/' });
							location.href = '/' + $('#email').val().toLowerCase();
						} else {
							swal("Error", response.attributes.msg, "error");
						}
					}
		    	});
		    } else {
		    	swal("Error!", "Passwords don't match", "error");
		    }

	    } else {
	    	swal("Error!", "Please, complete all fields", "error");
	    }
		return false;
	});
}

function checkOauth()
{
	var oauth = false;
	if (($.cookie('v') !== undefined) && ($.cookie('uid') !== undefined) && ($.cookie('u') !== undefined)) 
	{
		$('.login').hide();
		$('#signUp').hide();
		$('#loginButtonHead').hide();
		$('.logout').show();
		$('.float-button').show();
		oauth = true;
	} else {
		$.removeCookie('v', { path: '/' });
		$.removeCookie('uid', { path: '/' });
		$.removeCookie('u', { path: '/' });
		$('.login').show();
		$('.logout').hide();
		$('#signUp').show();
		$('loginButtonHead').show();
		$('.float-button').hide();
	}
	return oauth;
}

function bindLoginButtons () 
{
	$('.login').on('click', function() {
		vex.dialog.open({
		  message: 'Enter your username and password',
		  input: "<input name=\"username\" type=\"text\" placeholder=\"Username\" required />\n<input name=\"password\" type=\"password\" placeholder=\"Password\" required /> <div style='float:right'><a href='/create' style='text-align:right;'> Create Account</a></div></br>",
		  buttons: [
		    $.extend({}, vex.dialog.buttons.YES, {
		      text: 'Login'
		    }), $.extend({}, vex.dialog.buttons.NO, {
		      text: 'Cancel'
		    })
		  ],
		  callback: function(data) 
		  {
		    if (data) {  
		    	NProgress.start();
				var loginObj = new Login();
				var loginData = {username: data.username, pwd: data.password};
				loginObj.save(loginData, {
					success: function (response) 
					{
						if (response.attributes.st == 'ok') {
							mixpanel.identify(response.attributes.userId + "_" + response.attributes.username.toLowerCase());
							$.cookie('v', response.attributes.v, {expires: 7, path: '/' });
							$.cookie('uid', response.attributes.userId, {expires: 7, path: '/' });
							$.cookie('u', response.attributes.username.toLowerCase(), {expires: 7, path: '/' });
							location.href = '/' + response.attributes.username.toLowerCase();
						} else {
							$.removeCookie('v', { path: '/' });
							$.removeCookie('uid', { path: '/' });
							$.removeCookie('u', { path: '/' });
							vex.dialog.alert(response.attributes.msg);
						}
					}
	    		});
		    } 
			NProgress.done();
		  }
		});
		return false;
	});
}

function bindNewPaste() 
{
	$('.newpaste').on('click', function() {
		vex.dialog.open({
		  message: 'New Paste',
		  input: "<textarea class='pasteInput' placeholder='Paste or type here!' name='pasteInput' style='font-size:13px;background: #272822; color: #f8f8f2; border-radius: 0.5em; font-family: monospace;font-size: medium;height: 240px;' required></textarea>
			<div style='float:right'><input type='checkbox' name='privateFlag' value='1'>Private Paste</div></br>",
		  buttons: [
		    $.extend({}, vex.dialog.buttons.YES, {
		      text: 'Create'
		    }), $.extend({}, vex.dialog.buttons.NO, {
		      text: 'Cancel'
		    })
		  ],
		  callback: function(data) 
		  {
		  	if (data) 
		  	{
		  		var textStr = data.pasteInput;
		  		if (textStr != '') {
		  			NProgress.start();
				  	var Paste = new NewPasteModel();
					var pasteData = {
						v: $.cookie('v') + ":" + $.cookie('u'), 
						protected: data.privateFlag,
						text: textStr
					};

					console.log(pasteData);
					Paste.save(pasteData, {
						success: function (response) 
						{
							console.log(response);
							NProgress.done();
							if (response.attributes.st == 'ok') {
								location.href = "/" + response.attributes.username + "/" + response.attributes.documentId;
							} else {
								swal("Error", response.attributes.msg, "error");
							}
						}
			    	});
		  		}
		  	};
		  }
		})

		return false;
	});
}
