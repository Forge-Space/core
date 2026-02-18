package cmd

import (
	"fmt"
	"github.com/spf13/cobra"
)

// Version is set at build time: go build -ldflags "-X cmd.Version=1.0.0"
var Version = "dev"

var versionCmd = &cobra.Command{
	Use:   "version",
	Short: "Print the version number",
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Printf("myapp version %s\n", Version)
	},
}

func init() {
	rootCmd.AddCommand(versionCmd)
}
