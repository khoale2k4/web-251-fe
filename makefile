FOLDER ?= default_name

deploy-macos:
	
	rsync -a --delete --exclude='.git' "/Users/lekhoa/Desktop/BK/251/web/btl/fe/" "/Applications/XAMPP/xamppfiles/htdocs/fe/"

stop-apache:
	sudo apachectl stop

restart-apache:
	sudo /Applications/XAMPP/xamppfiles/xampp restartapache