# dat->csv->pandas df in Python
# useful for dealing with LoggerNet .dat files (from the DataLogger)
# Yedidya Harris

# importing the essential libraries
import pandas as pd
import subprocess
import os
import time
from pathlib import Path
import logging
import requests
import fnmatch, shutil

#########Instructions#########
# 1. Define paths to .dat file and project folder.
# 2. Go to csv_to_df function, and edit the wanted columns in your dataframe.
# 3. Run all.
# 4. Have fun with your new pandas dataframe.
##############################


#################DEFINE PATHS HERE, and then RUN ALL#################
# global vars
data_folder_path = "/content/projects/dataframes" # path to your project folder (where the csv is going to be saved)
file_dat_source = "/content/projects/LoggerNet/CR1000_M&M-VSLab_indoor_ProgRas.dat" # direct path to original .dat file 
######################################################################

# dat to csv conversion
def downloadCsv(file_dat_source):

    t = time.localtime()
    timestamp = time.strftime('%b-%d-%Y_%H%M', t)
    

    #url = 'link' # link to the *.dat file  - UNCOMMENT IF YOU WANT TO DOWNLOAD FROM URL
    #r = requests.get(url, allow_redirects=True) - UNCOMMENT IF YOU WANT TO DOWNLOAD FROM URL
    
    
    file_dat = f'{data_folder_path}/{timestamp}.dat'
    file_csv = f'{data_folder_path}/{timestamp}.csv'
    latest_csv = f'{data_folder_path}/latest.csv'
    shutil.copyfile(file_dat_source, file_dat) # making a copy of the latest dat (source)
    
    #open(file_dat, 'wb').write(r.content) # download source *.dat file from url to local - UNCOMMENT IF YOU WANT TO DOWNLOAD FROM URL

    # converting dat to csv
    with open(file_dat) as f:
        with open(file_csv, "w") as f1:
            next(f) # skip false header line
            for line in f:
                f1.write(line)

    shutil.copyfile(file_csv, latest_csv) # making a copy of the latest csv
       
    # remove temp dat+ csv files, leaving only latest.csv
    if os.path.exists(file_dat):
      os.remove(file_dat)
    if os.path.exists(file_csv):
      os.remove(file_csv)
   
# csv to pandas df conversion
def csv_to_df(data_folder_path):
  df = pd.read_csv(f'{data_folder_path}/latest.csv', parse_dates=['TIMESTAMP'], low_memory=False) #

  # convert columns to numeric values
  for col in df.columns:
    if col != "TIMESTAMP": 
      df[col] = df[col].astype(float, errors = 'ignore') 
      df.dropna(subset = [col], inplace=True)

  # df['Par_Avg'] = df['Par_Avg'].astype(float, errors = 'ignore') # convert columns to numeric values
  # df.dropna(subset = ['Par_Avg'], inplace=True)
  
  df = df[['TIMESTAMP','Par_Avg', 'Temp_in_Avg', 'Temp_out_Avg', 'Rh_in_Avg', 'Rh_out_Avg']] # choose your wanted columns from your df
  df = df.iloc[3:] #take the data, starting from the 3rd row (in your dat file, you may need a different start row)
  df['TIMESTAMP'] = pd.to_datetime(df['TIMESTAMP']) # convert timestamp column to datetime object type
  return df

##########CALLING THE FUNCTIONS##########
# calling the functions to convert dat->csv->pandas df
downloadCsv(file_dat_source) #don't forget to define paths at top
my_df = csv_to_df(data_folder_path) # your dataframe object
#########################################
