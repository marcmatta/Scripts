String.prototype.replaceAll = function(str1, str2, ignore) 
{
    return this.replace(new RegExp(str1.replace(/([\/\,\!\\\^\$\{\}\[\]\(\)\.\*\+\?\|\<\>\-\&])/g,"\\$&"),(ignore?"gi":"g")),(typeof(str2)=="string")?str2.replace(/\$/g,"$$$$"):str2);
}

var selectedExportOptions = {};

var iOSExportOptions = [
    {
        name: "Normal",
        scale: 100,
        space: "-",
        suffix: "",
        folder: "iOS images",
        subfolder: ""
    },
    {
        name: "2x Retina",
        scale: 200,
        space: "-",
        suffix: "@2x",
        folder: "iOS images",
        subfolder:""
    },
    {
        name: "3x Retina",
        scale: 300,
        space: "-",
        suffix: "@3x",
        folder: "iOS images",
        subfolder:""
    }
];

var AndroidExportOtions = [
    {
        name: "mdpi",
        scale: 100,
        space: "_",
        suffix: "",
        folder: "Android images",
        subfolder:"mdpi"
    },
    {
        name: "hdpi",
        scale: 150,
        space: "_",
        suffix: "",
        folder: "Android images",
        subfolder:"hdpi"
    },
    {
        name: "xhdpi",
        scale: 200,
        space: "_",
        suffix: "",
        folder: "Android images",
        subfolder:"xhdpi"
    },
    {
        name: "xxhdpi",
        scale: 300,
        space: "_",
        suffix: "",
        folder: "Android images",
        subfolder:"xxhdpi"
    },
    {
        name: "xxxhdpi",
        scale: 400,
        space: "_",
        suffix: "",
        folder: "Android images",
        subfolder:"xxxhdpi"
    }
];

var folder = Folder.selectDialog("Select export directory");
var document = app.activeDocument;
var projectTextBox;
var fileNameTextBox;
var folderNameTextBox;
var filePrefixTextBox;
                     
if(document && folder) {
    var dialog = new Window("dialog","Select export options");
    var osGroup = dialog.add("group");
    
    var iOSOptions = createSelectionPanel("iOS", iOSExportOptions, osGroup);
    var androidOptions = createSelectionPanel("Android", AndroidExportOtions, osGroup);
    
    var pTextboxGroup = dialog.add("group");
    pTextboxGroup.alignment = "right";
    pTextboxGroup.add("statictext", undefined, "Project Name");
    projectTextBox = pTextboxGroup.add("edittext");
    projectTextBox.size = [200, 30];
    
    var fnTextboxGroup = dialog.add("group");
    fnTextboxGroup.alignment = "right";
    fnTextboxGroup.add("statictext", undefined, "File Name*");
    fileNameTextBox = fnTextboxGroup.add("edittext");
    fileNameTextBox.size = [200, 30];
    
    var pfTextboxGroup = dialog.add("group");
    pfTextboxGroup.alignment = "right";
    pfTextboxGroup.add("statictext", undefined, "Prefix");
    filePrefixTextBox = pfTextboxGroup.add("edittext");
    filePrefixTextBox.size = [200, 30];
    
    var fTextboxGroup = dialog.add("group");
    fTextboxGroup.alignment = "right";
    fTextboxGroup.add("statictext", undefined, "Folder Name");
    folderNameTextBox = fTextboxGroup.add("edittext");
    folderNameTextBox.size = [200, 30];
    
    var buttonGroup = dialog.add("group");
    var okButton = buttonGroup.add("button", undefined, "Export");
    var cancelButton = buttonGroup.add("button", undefined, "Cancel");
    
    okButton.onClick = function() {
        if (!fileNameTextBox.text)
        {
            alert('File name is required.');
        }else
        {
            for (var key in selectedExportOptions) {
                if (selectedExportOptions.hasOwnProperty(key)) {
                    var item = selectedExportOptions[key];
                    exportToFile(item.scale, item.space, item.suffix, item.folder, item.subfolder);
                }
            }
            this.parent.parent.close();
        }
    };
    
    cancelButton.onClick = function () {
        this.parent.parent.close();
    };

    dialog.show();
}

function createSelectionPanel(name, array, parent) {
    var panel = parent.add("panel", undefined, name);
    panel.alignChildren = "left";
    panel.alignment = "top";
    
    for(var i = 0; i < array.length;  i++) {
        var cb = panel.add("checkbox", undefined, "\u00A0" + array[i].name);
        cb.item = array[i];
        cb.value = true;
        selectedExportOptions[array[i].name] = array[i];
        
        cb.onClick = function() {
            if(this.value) {
                selectedExportOptions[this.item.name] = this.item;
                //alert("added " + this.item.name);
            } else {
                delete selectedExportOptions[this.item.name];
                //alert("deleted " + this.item.name);
            }
        };
    }
};

function exportToFile(scale, space, suffix, fldr, sfldr) {
    var i, ab, file, options;

    var folderName, project, cfolder;
    var filePrefix, fileName;
    
    folderName = folder.absoluteURI + "/" ;
    project = projectTextBox.text;
    fileName = fileNameTextBox.text;
    filePrefix = filePrefixTextBox.text;
    cfolder = folderNameTextBox.text;
    
    if (project && !(project === ""))
        folderName = folderName + project + " " + fldr + "/";
    else
        folderName = folderName + fldr + "/";
    
    if (cfolder && !(cfolder === ""))
        folderName = folderName + cfolder + "/";
    
    if (sfldr && !(sfldr === ""))
       folderName = folderName + sfldr;
    
    var myFolder = new Folder(folderName);
    if(!myFolder.exists) myFolder.create();    
    
    if (filePrefix && !(filePrefix === ""))
        fileName = filePrefix + space + fileName;
    
    if (suffix && !(suffix === ""))
        fileName = fileName + suffix;
    
    fileName = fileName.replaceAll(" ", space);
    
	for (i = document.artboards.length - 1; i >= 0; i--) {
		document.artboards.setActiveArtboardIndex(i);
		ab = document.artboards[i];
		
		file = new File( myFolder.fsName + "/" + fileName + ".png");
		
		options = new ExportOptionsPNG24();
		options.antiAliasing = true;
		options.transparency = true;
		options.artBoardClipping = true;
		options.verticalScale = scale;
		options.horizontalScale = scale;
		
		document.exportFile(file, ExportType.PNG24, options);
	}
}
