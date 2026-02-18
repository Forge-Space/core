#!/bin/bash
# Output Formatter Utility for Cost Monitoring Scripts
# Provides consistent colors, headers, and formatting across all scripts

# Color definitions
export RED='\033[0;31m'
export GREEN='\033[0;32m'
export YELLOW='\033[1;33m'
export BLUE='\033[0;34m'
export PURPLE='\033[0;35m'
export CYAN='\033[0;36m'
export WHITE='\033[1;37m'
export GRAY='\033[0;37m'
export BOLD='\033[1m'
export UNDERLINE='\033[4m'
export NC='\033[0m' # No Color

# ASCII Headers
export COST_HEADER='
╔══════════════════════════════════════════════════════════════╗
║                    💰 COST MONITORING                       ║
║                 Forge Patterns Cost Analysis                ║
╚══════════════════════════════════════════════════════════════╝'

export TERRAFORM_HEADER='
╔══════════════════════════════════════════════════════════════╗
║                  🏗️ TERRAFORM COST MONITOR                   ║
║              Infrastructure as Code Cost Analysis             ║
╚══════════════════════════════════════════════════════════════╝'

export KUBERNETES_HEADER='
╔══════════════════════════════════════════════════════════════╗
║                  ☸️ KUBERNETES COST MONITOR                  ║
║              Container Orchestration Cost Analysis          ║
╚══════════════════════════════════════════════════════════════╝'

export FREE_TIER_HEADER='
╔══════════════════════════════════════════════════════════════╗
║                    🆓 FREE TIER MONITOR                      ║
║                 Zero Cost Optimization Analysis              ║
╚══════════════════════════════════════════════════════════════╝'

export BUDGET_HEADER='
╔══════════════════════════════════════════════════════════════╗
║                    💰 BUDGET ALERTS MONITOR                   ║
║                 Budget Tracking and Cost Analysis             ║
╚══════════════════════════════════════════════════════════════╝'

export VALIDATION_HEADER='
╔══════════════════════════════════════════════════════════════╗
║                  🔍 DEVELOPMENT WORKFLOW VALIDATOR           ║
║              Trunk Based Development & Versioning           ║
╚══════════════════════════════════════════════════════════════╝'

# Section separators
export SECTION_SEPARATOR='
────────────────────────────────────────────────────────────────
'

export DOUBLE_SEPARATOR='
═══════════════════════════════════════════════════════════════
'

# Box drawing characters for custom boxes
export BOX_TOP_LEFT='╔'
export BOX_TOP_RIGHT='╗'
export BOX_BOTTOM_LEFT='╚'
export BOX_BOTTOM_RIGHT='╝'
export BOX_HORIZONTAL='═'
export BOX_VERTICAL='║'
export BOX_CROSS='╬'
export BOX_T_DOWN='╦'
export BOX_T_UP='╩'
export BOX_T_RIGHT='╠'
export BOX_T_LEFT='╣'

# Icon definitions
export ICON_SUCCESS='✅'
export ICON_WARNING='⚠️'
export ICON_ERROR='❌'
export ICON_INFO='ℹ️'
export ICON_ROCKET='🚀'
export ICON_MONEY='💰'
export ICON_CHART='📊'
export ICON_SETTINGS='⚙️'
export ICON_SHIELD='🛡️'
export ICON_CLOCK='⏰'
export ICON_TARGET='🎯'
export ICON_LIGHTNING='⚡'
export ICON_FIRE='🔥'
export ICON_STAR='⭐'
export ICON_CHECK='✓'
export ICON_CROSS='✗'

# Logging functions with enhanced formatting
log_info() {
    echo -e "${BLUE}${ICON_INFO} $1${NC}"
}

log_success() {
    echo -e "${GREEN}${ICON_SUCCESS} $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}${ICON_WARNING} $1${NC}"
}

log_error() {
    echo -e "${RED}${ICON_ERROR} $1${NC}"
}

log_header() {
    echo -e "${CYAN}${BOLD}$1${NC}"
}

log_section() {
    echo -e "${PURPLE}${BOLD}$1${NC}"
    echo "$SECTION_SEPARATOR"
}

log_subsection() {
    echo -e "${WHITE}${BOLD}$1${NC}"
}

log_highlight() {
    echo -e "${YELLOW}${BOLD}$1${NC}"
}

# Progress indicator
show_progress() {
    local message=$1
    local delay=${2:-0.1}
    echo -n "${BLUE}${ICON_INFO} $1${NC}"
    for i in {1..3}; do
        echo -n "."
        sleep $delay
    done
    echo " ${GREEN}${ICON_SUCCESS} Done${NC}"
}

# Box drawing function
draw_box() {
    local title=$1
    local content=$2
    local width=60
    
    echo "${BOX_TOP_LEFT}$(printf "%*s" $width | tr ' ' "$BOX_HORIZONTAL")${BOX_TOP_RIGHT}"
    printf "${BOX_VERTICAL}%*s%s%*s${BOX_VERTICAL}\n" $((($width - ${#title}) / 2)) "" "$title" $((($width - ${#title}) / 2)) ""
    echo "${BOX_T_RIGHT}$(printf "%*s" $width | tr ' ' "$BOX_HORIZONTAL")${BOX_T_LEFT}"
    
    while IFS= read -r line; do
        printf "${BOX_VERTICAL} %-*s ${BOX_VERTICAL}\n" $((width - 2)) "$line"
    done <<< "$content"
    
    echo "${BOX_BOTTOM_LEFT}$(printf "%*s" $width | tr ' ' "$BOX_HORIZONTAL")${BOX_BOTTOM_RIGHT}"
}

# Status indicator with color
show_status() {
    local status=$1
    local message=$2
    
    case $status in
        "success")
            echo -e "${GREEN}${ICON_SUCCESS} $message${NC}"
            ;;
        "warning")
            echo -e "${YELLOW}${ICON_WARNING} $message${NC}"
            ;;
        "error")
            echo -e "${RED}${ICON_ERROR} $message${NC}"
            ;;
        "info")
            echo -e "${BLUE}${ICON_INFO} $message${NC}"
            ;;
        *)
            echo -e "${GRAY}$message${NC}"
            ;;
    esac
}

# Print formatted list items
print_list_item() {
    local icon=$1
    local item=$2
    local color=$3
    
    case $color in
        "green")
            echo -e "${GREEN}$icon $item${NC}"
            ;;
        "yellow")
            echo -e "${YELLOW}$icon $item${NC}"
            ;;
        "red")
            echo -e "${RED}$icon $item${NC}"
            ;;
        "blue")
            echo -e "${BLUE}$icon $item${NC}"
            ;;
        *)
            echo -e "$icon $item"
            ;;
    esac
}

# Print centered text
print_centered() {
    local text=$1
    local width=${2:-60}
    local padding=$((($width - ${#text}) / 2))
    
    printf "%*s%s%*s\n" $padding "" "$text" $padding ""
}

# Print banner
print_banner() {
    local text=$1
    local color=${2:-CYAN}
    
    echo "$DOUBLE_SEPARATOR"
    print_centered "$text" 60
    echo "$DOUBLE_SEPARATOR"
}

# Print footer
print_footer() {
    echo "$DOUBLE_SEPARATOR"
    print_centered "${ICON_ROCKET} Ready for production!" 60
    echo "$DOUBLE_SEPARATOR"
}

# Initialize formatting
init_formatting() {
    # Ensure terminal supports colors
    if [[ -t 1 ]]; then
        export COLORS_SUPPORTED=true
    else
        export COLORS_SUPPORTED=false
    fi
}

# Export all functions for use in other scripts
export -f log_info log_success log_warning log_error log_header log_section log_subsection log_highlight
export -f show_progress show_status print_list_item print_centered print_banner print_footer draw_box
export -f init_formatting
