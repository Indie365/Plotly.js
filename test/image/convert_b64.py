from sqlite3 import NotSupportedError
import numpy
import base64

plotlyjsTypes = {
    'int8': 'i1',
    'uint8': 'u1',
    'int16': 'i2',
    'uint16': 'u2',
    'int32': 'i4',
    'uint32': 'u4',
    'float32': 'f4',
    'float64': 'f8'
}

int32bounds = numpy.iinfo(numpy.int32)
uint32bounds = numpy.iinfo(numpy.uint32)

# List mainly including keys with type of 'info_array'
# Simply having two items the b64 option is not supported by plotly.js
# This list also includes cases of type 'any' that we don't to be converted
# e.g. in mapbox layers or geojson
rangeKeys = [
    'geojson',
    'layers',
    'subplots',
    'xaxes',
    'yaxes',
    'domain',
    'range',
    'dtickrange',
    'constraintrange',
    'bounds',
    'parallels',
    'sector',
    'span',
    'zmin',
    'zmax',
    'args',
    'args2',
    'values',
    'groups',
    'selectedpoints',
    'opacityscale',
    'transforms', # deprecated
    'cameraposition' # deprecated
]

def arraysToB64(obj, newObj) :
    for key, val in obj.items() :
        if key in rangeKeys :
            newObj[key] = val
        elif isinstance(val, dict) :
            newObj[key] = dict()
            arraysToB64(val, newObj[key])
        elif isinstance(val, list) :
            try :
                arr = numpy.array(val)
            except Exception :
                newObj[key] = val
                continue

            if arr.dtype == 'object' :
                newList = list()
                for v in val :
                    if isinstance(v, dict) :
                        newList.append(arraysToB64(v, dict()))
                    else :
                        newList.append(v)

                newObj[key] = newList
            else :
                # skip converting arrays with 2 items or less
                if(arr.ndim == 1 and arr.shape[0] < 3) :
                    newObj[key] = val
                    continue

                # convert Big Ints until we could support them in plotly.js
                if str(arr.dtype) == 'int64' :
                    if arr.max() > int32bounds.max or arr.min() < int32bounds.min :
                        newObj[key] = val
                        continue

                    arr = arr.astype(numpy.int32)
                elif str(arr.dtype) == 'uint64' :
                    if arr.max() > uint32bounds.max or arr.min() < uint32bounds.min :
                        newObj[key] = val
                        continue

                    arr = arr.astype(numpy.uint32)

                if str(arr.dtype) in plotlyjsTypes :
                    newObj[key] = {
                        'dtype': plotlyjsTypes[str(arr.dtype)],
                        'bdata': base64.b64encode(arr).decode('ascii')
                    }

                    if(arr.ndim > 1) :
                        newObj[key]['shape'] = str(arr.shape)[1:-1]

                    #print(val)
                    #print('____________________')
                    #print(newObj[key])
                    #print('____________________')
                else :
                    newObj[key] = val

        else :
            newObj[key] = val

    return newObj