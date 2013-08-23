package com.botmind.gotgclient;

import com.botmind.framework.Screen;
import com.botmind.framework.implementation.AndroidGame;

public class GotGClient extends AndroidGame {
	
	public Screen getInitScreen() {
		return new GotGGameScreen(this);
	}

}
