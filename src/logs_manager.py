log_messages = []
log_box = None

def initialize_log_box(box):
    global log_box
    log_box = box

def log(message):
    global log_messages, log_box
    log_messages.append(message)
    if log_box:
        log_box.text_area("Logs", value="\n".join(log_messages), height=200)