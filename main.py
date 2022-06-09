from flask import Flask, request, render_template
#import modules.inxrd_noqt, modules.outxrd_noqt
import os, glob
import re

import numpy as np
import pandas as pd
from modules.calc import grain_size

YEAR = 2022
MONTH = 5
DEFAULT_PATH = rf"\\10.138.112.118\Analsis results\개인폴더\KYS\workfunction"
app = Flask("XRD Grain Size")

@app.route('/')
def root(SN_List = None):    
    SN_List = os.listdir(DEFAULT_PATH)        
    return render_template('index.html', SN_List=SN_List)

@app.route('/test', methods=['POST'])
def test():
    print(request.get_json())
    return "hi!"

@app.route('/submit', methods=['POST'])
def login(File_List = None):
    SN_Query = request.get_json()["SN"]
    File_List = glob.glob(f'{DEFAULT_PATH}\{SN_Query}\**', recursive=True)
    File_List = [x for x in File_List if ".avg" in x and "Survey.avg" not in x]
    #print(File_List)    
    Full_Dataset = {}
    Dataset = {}
    
    for file in File_List:
        data_path = f'{file}'
        try:
            f = open(data_path, 'r', encoding='UTF-16')
            data = f.readlines()
        except UnicodeError:
            f = open(data_path, 'r', encoding='UTF-8')
            data = f.readlines()

        x_info_idx = data.index('$SPACEAXES=1\n')
        energy = float(data[x_info_idx+1].split(',')[0].split('=')[-1])
        width = float(data[x_info_idx+1].split(',')[1])
        numpoints = int(data[x_info_idx+1].split(',')[2])
        x = 1486.68 - np.linspace(energy, energy + width*(numpoints-1), numpoints)
        x = np.array(x[::-1])
        y_info_idx = data.index('$DATA=*\n')
        y = ','.join(data[y_info_idx+1:]).split(',')

        if '        #empty#' in y:
            break

        for j in range(len(y)):
            if '\n' in y[j]:
                y[j] = y[j].strip('\n')
            if '=' in y[j]:
                y[j] = y[j][y[j].find('=')+1:]

            y[j] = float(y[j])*4

        y = np.array(y[::-1])
        df = pd.DataFrame(zip(x, y), columns=['Energy', 'Count'])
        print(df)
        
        Dataset[file] = {"Energy": df['Energy'].to_list(),
                         "Count": df['Count'].to_list()}
    
        '''
        df = pd.read_csv(data_path, header=2, sep="\t")    
        df.columns = ["Angle","Count"]
        Dataset[file] = {"Angle":df["Angle"].to_list(), "Count":df["Count"].to_list(), "Peaks_Pos":[], "Peaks_Height":[]}        
        '''
    Full_Dataset[f'{SN_Query}'] = Dataset
    return Full_Dataset
    


@app.route('/plot', methods=['POST'])   
def plot():
    Plot_Query = request.get_json()
    print("print: ", Plot_Query)
    '''
    data = Plot_Query["File"]
    sn = Plot_Query["SN"]
    data_path = f'{DEFAULT_PATH}\{sn}\{data}'    
    df = pd.read_csv(data_path, header=2, sep="\t")    
    df.columns = ["Angle","Count"]
    
    return {"SN":sn, "File": data, "Angle":df["Angle"].to_list(), "Count":df["Count"].to_list(), "Peaks":[]}
    '''
    return "hi"
'''
@app.route('/calc', methods=['POST'])   
def calc():
    calc_query = request.get_json()
    sn = calc_query["SN"]        
    file_list = calc_query["File"]
    peak_pos = calc_query["Peaks_Pos"]
    peak_height = calc_query["Peaks_Height"]    
        
    result = {}
    for idx in range(len(file_list)):        
        result[f'{file_list[idx]}'] = grain_size(sn, file_list[idx], peak_pos[idx], peak_height[idx])
    
    df_result = pd.DataFrame(columns=["File","FWHM","Grain Size","Peak"])
    
    for key in result.keys():
        
        df = pd.DataFrame(result[key])
        df["File"] = key
        df = df[["File","FWHM","Grain Size","Peak"]]
        df_result = pd.concat([df_result,df])
    
    #df_result.to_csv(f'{DEFAULT_PATH}\{SN_Query})
    return "Done"
'''
app.run(host="10.138.126.209")