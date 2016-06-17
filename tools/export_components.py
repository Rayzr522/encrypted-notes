from os import listdir, mkdir, rename
from os.path import isfile, join, isdir
import re

components_dir = './app/components/'
regex = r'export default (\w+)'
export_statement = "export { default as %s } from './%s'\n"

components = [f for f in listdir(components_dir) if f != 'index.js']
with open(components_dir + 'index.js', 'w') as index_file:
    for component in components:
        with open(components_dir + component, 'r') as component_file:
            file_contents = component_file.read()
            matches = re.search(regex, file_contents)
            if matches is None:
                print('Unable to process %s' % component)
                continue
            index_file.write(export_statement % (matches.group(1), component))
