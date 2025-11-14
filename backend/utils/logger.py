import logging
import sys


def setup_logger(name=None, level=logging.INFO):
    """Set up logger for Google Cloud Run."""

    logger = logging.getLogger(name)
    logger.setLevel(level)

    # Avoid adding handlers multiple times
    if logger.handlers:
        return logger

    # Console handler only (Cloud Run captures this)
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(level)

    # Simple format for Cloud Run
    formatter = logging.Formatter("  %(levelname)s - %(name)s - %(message)s")
    console_handler.setFormatter(formatter)

    logger.addHandler(console_handler)
    logger.propagate = False

    return logger


def get_logger(name):
    return setup_logger(name)
