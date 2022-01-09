# Yedidya Harris
# 09/01/2022
# a script to reverse the order of the lines in a text file

# When did I need this script?
# On my plotting webpage of sensor data, I have a log file presented. It is an iframe, that shows a txt file.
# I wanted the newest logged info to be at top, so the user doesn't have to scroll to the bottom of the iframe.
# Using the following code, I reverse the order of my log file.

# vars: path file for source txt file and destinatio file
filePathSource = 'log/LoggerNet.log' # CHANGE TO YOUR FILE PATH
filePathDestination = 'log/LoggerNet_reversed.log' # CHANGE TO YOUR FILE PATH


# the function, there is no need to change anything here
def reverseTextLineOrder (filePathSource, filePathDestination):
    with open(filePathSource, "r") as sourceTxt: 
        data = sourceTxt.readlines()
    data_2 = data[::-1] # reversing the order of lines  
    with open(filePathDestination, "w+") as destTxt: # if the destination file doesn't exist, it will be created
        destTxt.writelines(data_2)
        
        
# calling the function       
reverseTextLineOrder (filePathSource, filePathDestination) # reverse the line order of a text file
