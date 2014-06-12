import sys, subprocess, os, os.path

def call(cmd):
    print "> %s" % cmd
    subprocess.call(cmd, shell=True, stdin=sys.stdin, stdout=sys.stdout)

def put_file(file, contents):
    f = open(os.path.join(os.getcwd(), file), 'w')
    f.write(contents)
    f.close()

def get_file(file):
    f = open(os.path.join(os.getcwd(), file), 'r')
    o = f.read()
    f.close()
    return o

def mkdirs(dir):
    try:
        os.makedirs(dir)
    except:
        pass
